import {Extra, Telegram} from "telegraf";
import moment = require("moment");
import {Covid19RegionsController} from "./Covid19Region/covid19RegionController";
import {FollowerController} from "./Follower/followerController";

const CronJob = require('cron').CronJob;
const request = require('request');

const nodeBot = require('telegraf');
const session = require('telegraf/session');
import {loggerSystemLevel, loggerUserLevel} from "./logger"

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
            loggerUserLevel.info(`${ctx.update.message.from.id} new User`);
            ctx.reply(`Willkommen ${ctx.update.message.from.first_name},\n\n1️⃣ Sende mir deinen Standort oder den Standort der Region zu, von der du Covid19 Statistiken erhalten möchtest.\n\n2️⃣ Erhalte täglich ein Update.\n\n✅ Du kannst die Region jederzeit ändern.`);
            await this.follower.create(ctx.update.message.from.id);
        });

        this.telegraf.command('quelle', async ctx => {
            loggerUserLevel.info(`${ctx.update.message.from.id} command 'quelle'`);
            ctx.replyWithHTML(
                "Die Daten sind die „Fallzahlen in Deutschland“ des <a href='https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Fallzahlen.html'>Robert Koch-Institut (RKI)</a> \n\n" +
                "Quellenvermerk: Robert Koch-Institut (RKI), dl-de/by-2-0 \n" +
                "API: <a href='https://npgeo-corona-npgeo-de.hub.arcgis.com/datasets/dd4580c810204019a7b8eb3e0b329dd6_0'>NPGEO Corona</a>",
            );
        });

        this.telegraf.command('update', async ctx => {
            loggerUserLevel.info(`${ctx.update.message.from.id} command 'update'`);
            ctx.reply('Sende mir einfach wieder einen Standort um deine Region zu ändern.')
        });

        this.telegraf.command('info', async ctx => {
            loggerUserLevel.info(`${ctx.update.message.from.id} command 'info'`);
            ctx.reply('Comming soon! \n🔴 50+ 🏘🚷\n🟠 35 bis 50 😷\n🟡 20 bis 35 😧\n🟢 0 bis 20 ☺')
        });

        this.telegraf.on('location', async ctx => {
            loggerUserLevel.info(`${ctx.update.message.from.id} send new location`);

            let loadingMsg;
            try {
                loadingMsg = await ctx.reply('Ort wird geladen...');
            } catch (e) {
                loadingMsg = await this.telegram.sendMessage(ctx.update.message.from.id, 'Ort wird geladen...');
            }

            let location = null;
            try {
                location = await this.covid19Region.findLocationForPoint([ctx.update.message.location.longitude, ctx.update.message.location.latitude]);
            } catch (e) {
            }

            if (!location) {
                loggerUserLevel.error(`${ctx.update.message.from.id} location could not be updated [${ctx.update.message.location.longitude}, ${ctx.update.message.location.latitude}] (long, lat)`, new Error());
                try {
                    await ctx.reply(`Der Standort konnte keiner Region zugeordnet werden. Versuche einen anderen Standort.`);
                } catch (e) {
                    await this.telegram.sendMessage(ctx.update.message.from.id, `Der Standort konnte keiner Region zugeordnet werden. Versuche einen anderen Standort.`);
                }
                return;
            }

            await this.follower.update(ctx.update.message.from.id, location.id);
            loggerUserLevel.info(`${ctx.update.message.from.id} location updated to ${location.id}`);

            try {
                await this.telegram.editMessageText(ctx.update.message.from.id, loadingMsg.message_id, null, `Dein Ort wurde auf ${location.name} aktualisiert.`);
            } catch (e) {
                await this.telegram.deleteMessage(ctx.update.message.from.id, loadingMsg.message_id);
                await ctx.reply(`Dein Ort wurde auf ${location.name} aktualisiert.`);
            }

            this.sendUpdate(ctx.update.message.from.id, location.id);
        });

        await this.telegraf.launch();
    }

    async sendUpdate(chatId: string, regionId: string) {
        const cases = (await this.covid19Region.getOneLocation(regionId)).cases7_per_100k;
        let warningMsg;

        if (cases < 20) {
            warningMsg = '🟢 Aktuell ist alles im grünen Bereich ☺. Sei aber trotzdem Vorsichtig!';
        } else if (cases < 35) {
            warningMsg = '🟡 Es gibt einige Fälle in deiner Region 😧. Behalte die Ampel im Blick.';
        } else if (cases < 50) {
            warningMsg = '🟠 Es gibt aktuell viele Fälle in deiner Region 😷. Behalte die Nachrichten im Blick, es gibt vermutlich Einschränkungen.';
        } else {
            warningMsg = '🔴 Es gibt sehr viele Fälle in deiner Region 🏘🚷. Bleibe am besten zu Hause und verfolge aktiv die Nachrichten. In deiner Region gibt es sehr wahrscheinlich Einschränkungen';
        }
        await this.telegram.sendMessage(chatId, `${cases} Fälle auf 100.000 Einwohner in den letzten 7 Tagen.\n\n${warningMsg}`);
    }

    async scheduleUpdates() {

        const jobTime = '0 8 * * *';
        const job = new CronJob(jobTime, async () => {
            loggerSystemLevel.info(`Scheduled Update started`);
            let follower = await this.follower.getAllWithLocation();
            follower.forEach(follower => {
                this.sendUpdate(follower.telegramId, follower.regionId);
            });
        });
        job.start();
    }
}
