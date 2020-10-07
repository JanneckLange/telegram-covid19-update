import {ICovid19RegionData, ICovid19Region} from './covid19Region';

const request = require('request');
import * as proj4 from "proj4";
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import * as turf from '@turf/helpers'


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
                    geometry: [item.geometry.rings[0].map((wgs84Point: Array<number>): Array<number> => {
                        return proj4("+proj=utm +zone=32", "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs", wgs84Point)
                    })]
                }
            });
            resolve(regions);
        })));
    }

    public async findLocationForPoint(point: Array<number> = [
        8.469085693359375,
        49.48775429690567
    ]): Promise<{ bundeslandId: string, id: string, name: string }> {
        const regions: ICovid19Region[] = await this.getAllLocations();
        const location = regions.find(region => {
            return booleanPointInPolygon(point, turf.polygon(region.geometry))
        });
        if(!location){
            return null;
        }
        return {bundeslandId: location.bundeslandId, id: location.id, name: location.name,}
    }

    private static round(num: number) {
        return Math.round((num + Number.EPSILON) * 100) / 100
    }
}
