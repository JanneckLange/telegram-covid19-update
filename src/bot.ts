import {Telegram} from "telegraf";
import moment = require("moment");

const CronJob = require('cron').CronJob;
const request = require('request');


export class CoronaUpdate {
    telegram;

    constructor() {
        if (process.env.BOT_TOKEN === undefined)
            throw new Error("BOT_TOKEN is undefined");
        this.telegram = new Telegram(process.env.BOT_TOKEN);
        this.main();
    }

    main() {
        this.sendUpdate('started');
        const jobTime = '00 8 * * *';
        const job = new CronJob(jobTime, async () => {
            this.sendUpdate(`${await this.getCasesPer100kIn7Days()} Fälle auf 100.000 Einwohner in den letzten 7 Tagen.`);
        });
        job.start();
    }

    async getCasesPer100kIn7Days(locationId: string = '07316'): Promise<number> {
        let url = `https://services7.arcgis.com/mOBPykOjAyBO2ZKk/arcgis/rest/services/RKI_Landkreisdaten/FeatureServer/0/query?where=RS=${locationId}&outFields=last_update,cases7_per_100k&f=json`;
        return new Promise(((resolve, reject) => request(url, {json: true}, (err, res, body) => {
            if (err) {
                reject(err);
            }
            resolve(this.round(body.features[0].attributes.cases7_per_100k));
        })));
    }

    async sendUpdate(text: string) {
        await this.telegram.sendMessage(14417823, text);
    }

    round(num: number) {
        return Math.round((num + Number.EPSILON) * 100) / 100
    }

}
