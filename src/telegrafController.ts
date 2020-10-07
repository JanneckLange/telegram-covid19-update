import {Extra, Telegram} from "telegraf";
import moment = require("moment");
import {Covid19RegionsController} from "./Covid19Region/covid19RegionController";
import {FollowerController} from "./Follower/followerController";

const CronJob = require('cron').CronJob;
const request = require('request');

const nodeBot = require('telegraf');
const session = require('telegraf/session');

export class TelegrafController {
    telegram;
    telegraf;
    covid19Region: Covid19RegionsController;
    follower: FollowerController;

    constructor() {
        if (process.env.BOT_TOKEN === undefined)
            throw new Error("BOT_TOKEN is undefined");
        this.telegram = new Telegram(process.env.BOT_TOKEN);
        this.covid19Region = new Covid19RegionsController();
        this.follower = new FollowerController();

        this.main();
        this.scheduleUpdates();
    }

    async main() {
        this.telegraf = new nodeBot(process.env.BOT_TOKEN);
        this.telegraf.use(session());
        this.telegram = new Telegram(process.env.BOT_TOKEN);

        this.telegraf.start(async ctx => {
            ctx.reply(`Willkommen ${ctx.update.message.from.first_name},\n\n1️⃣ Sende mir deinen Standort oder den Standort der Region zu, von der du Covid19 Statistiken erhalten möchtest.\n\n2️⃣ Erhalte täglich ein Update.\n\n✅ Du kannst die Region jederzeit ändern.`);
            await this.follower.create(ctx.update.message.from.id);
        });

        this.telegraf.command('quelle', async ctx => {
            ctx.replyWithHTML(
                "Die Daten sind die „Fallzahlen in Deutschland“ des <a href='https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Fallzahlen.html'>Robert Koch-Institut (RKI)</a> \n\n" +
                "Quellenvermerk: Robert Koch-Institut (RKI), dl-de/by-2-0 \n"+
                "API: <a href='https://npgeo-corona-npgeo-de.hub.arcgis.com/datasets/dd4580c810204019a7b8eb3e0b329dd6_0'>NPGEO Corona</a>",
            );
        });

        this.telegraf.on('location', async ctx => {
            ctx.reply('Ort wird geladen...');
            let location = await this.covid19Region.findLocationForPoint([ctx.update.message.location.longitude, ctx.update.message.location.latitude]);
            await this.follower.update(ctx.update.message.from.id, location.id);
            await ctx.reply(`Dein Ort wurde auf ${location.name} aktualisiert.`);
            this.sendUpdate(ctx.update.message.from.id, location.id);
        });

        await this.telegraf.launch();
    }

    async sendUpdate(chatId: string, regionId: string) {
        this.telegram.sendMessage(chatId, `${(await this.covid19Region.getOneLocation(regionId)).cases7_per_100k} Fälle auf 100.000 Einwohner in den letzten 7 Tagen.`);
    }

    async scheduleUpdates() {

        const jobTime = '0 8 * * *';
        const job = new CronJob(jobTime, async () => {
            let follower = await this.follower.getAllWithLocation();
            follower.forEach(follower => {
                this.sendUpdate(follower.telegramId, follower.regionId);
            });
        });
        job.start();
    }
}
