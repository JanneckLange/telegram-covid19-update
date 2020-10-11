import {ICovid19RegionData, ICovid19Region} from './covid19Region';

const request = require('request');
import * as proj4 from "proj4";


export class Covid19RegionsController {

    public async getOneLocation(locationId: string): Promise<ICovid19RegionData> {
        try {
            let url = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=RS=${locationId}&outFields=last_update,cases7_per_100k,RS,cases,deaths,EWZ,GEN&f=json`;
            return new Promise(((resolve, reject) => request(url, {json: true}, (err, res, body) => {
                if (err) {
                    reject(err);
                }
                resolve({
                    id: body.features[0].attributes.RS,
                    last_update: body.features[0].attributes.last_update,
                    cases: body.features[0].attributes.cases,
                    cases7_per_100k: Covid19RegionsController.round(body.features[0].attributes.cases7_per_100k),
                    deaths: body.features[0].attributes.deaths,
                    einwohner: body.features[0].attributes.EWZ,
                    name: body.features[0].attributes.GEN,
                });
            })));
        } catch (err) {
            console.error('Caught error', err);
        }
    }

    public async getAllLocations(): Promise<ICovid19Region[]> {
        let url = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=1%3D1&outFields=RS,GEN,BL,BL_ID,county&f=json&geometryType=esriGeometryPolygon`;
        return new Promise(((resolve, reject) => request(url, {json: true}, (err, res, body) => {
            if (err) {
                reject(err);
            }
            let regions = body.features.map((item): ICovid19Region => {
                return {
                    bundesland: item.attributes.BL,
                    bundeslandId: item.attributes.BL_ID,
                    county: item.attributes.country,
                    name: item.attributes.GEN,
                    id: item.attributes.RS,
                    geometry: item.geometry.rings.map((arr) => {
                        return arr.map((wgs84Point: Array<number>): Array<number> => {
                            return proj4("+proj=utm +zone=32", "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs", wgs84Point);
                        });
                    })
                }
            });
            // console.log(regions)

            // const fs = require('fs');
            // fs.writeFile('test.json', JSON.stringify(regions), function (err) {
            //     if (err) return console.log(err);
            //     console.log('Hello World > helloworld.txt');
            // });

            resolve(regions);
        })));
    }

    public async findLocationForPoint(point: [number, number] = [9.895385, 53.54986]): Promise<{ bundeslandId: string, id: string, name: string }> {
        const regions: ICovid19Region[] = await this.getAllLocations();
        const location = regions.find(region => {
            try {
                return Covid19RegionsController.isPointInsideGeoJson(point, region.geometry);
            } catch (e) {
                console.error(`Point ${point} in ${region.name} | ${region.id}`);
                console.error(e);
                return false;
            }
        });
        return !location ? null : {bundeslandId: location.bundeslandId, id: location.id, name: location.name,}
    }

    /**
     * check if a geoPoint is inside a GeoJSON polygon
     * @param point
     * @param vs
     */
    static isPointInsideGeoJson(point: [number, number], vs: Array<Array<Array<number>>>) {
        return !!vs.find(arr => {
            return Covid19RegionsController.isPointInsidePolygon(point, arr);
        });
    }

    /**
     * check if a geoPoint is inside a single polygon
     * @param point
     * @param vs
     */
    static isPointInsidePolygon(point, vs) {
        // ray-casting algorithm based on
        // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html

        const x = point[0], y = point[1];

        let inside = false;
        for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            const xi = vs[i][0], yi = vs[i][1];
            const xj = vs[j][0], yj = vs[j][1];

            const intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        return inside;
    };

    private static round(num: number) {
        return Math.round((num + Number.EPSILON) * 100) / 100
    }
}
