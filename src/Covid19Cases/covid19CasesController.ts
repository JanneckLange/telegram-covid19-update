import {ICovid19Cases} from './covid19Cases';

const request = require('request');

export class Covid19CasesController {

    public async getByUpdateTime(): Promise<ICovid19Cases[]> {
        try {
            let url = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=RS=${locationId}&outFields=last_update,cases7_per_100k&f=json`;
            let items = await request(url, {json: true});
            // let cases
            // resolve(this.round(body.features[0].attributes.cases7_per_100k));

            items = items.map((item) => {
                return {id: item._id, description: item.description}
            });
            return items;
        } catch (err) {
            console.error('Caught error', err);
        }
    }
}
