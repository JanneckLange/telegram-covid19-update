import {Extra, Telegram} from "telegraf";
import moment = require("moment");
import {Covid19RegionsController} from "./Covid19Region/covid19RegionController";
import {FollowerController} from "./Follower/followerController";

const CronJob = require('cron').CronJob;

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
            ctx.session.locationPromisse = null;
            loggerUserLevel.info(`${ctx.update.message.from.id} new User`);
            ctx.reply(`Willkommen ${ctx.update.message.from.first_name},\n\n1️⃣ Sende mir deinen Standort oder den Standort der Region zu, von der du Covid19 Statistiken erhalten möchtest.\n\n2️⃣ Erhalte täglich ein Update.\n\n✅ Du kannst die Region jederzeit ändern.`);
            await this.follower.create(ctx.update.message.from.id, ctx.update.message.from.first_name ? ctx.update.message.from.first_name : ctx.update.message.from.username);
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
            ctx.replyWithHTML('<u>Fälle</u>: Die Zahl gibt die neuen Infektionen der letzten 7 Tage auf 100.000 Einwohner an. Anhand dieses Wertes beschließen die jeweiligen Regionen die aktuellen Einschränkungen und ihr weiteres Vorgehen. \n\nDiese Ampel soll die Zahl verbildlichen. Sie wird auch für dein Tägliches Update verwendet.\n🔴 50+ 🏘🚷\n🟠 35 bis 50 😷\n🟡 20 bis 35 😧\n🟢 0 bis 20 ☺')
        });

        this.telegraf.on('location', async ctx => {
            if (ctx.session.locationPromisse !== undefined && ctx.session.locationPromisse !== null) {
                ctx.reply('Eine andere Aktion wartet noch auf deine Antwort.');
                // console.log(ctx.session.locationPromisse);
                return;
            }
            this.locationUpdateHandling(ctx);
        });

        await this.telegraf.launch();
    }

    async locationUpdateHandling(ctx) {
        const userId = ctx.update.message.from.id;
        const point: [number, number] = [ctx.update.message.location.longitude, ctx.update.message.location.latitude];
        loggerUserLevel.info(`${userId} send new location: ${point}`);

        ctx.session.locationPromisse = this.covid19Region.findLocationForPoint(point);

        let telegramMsg = await this.telegram.sendMessage(userId, 'Als was möchtest du diesen Ort festlegen?', {
            reply_markup: {
                inline_keyboard: [[
                    {text: 'Home 🏠', callback_data: `location-0-${userId}-${point[0]}-${point[1]}`},
                    {text: 'Work 🏢', callback_data: `location-1-${userId}-${point[0]}-${point[1]}`}
                ]]
            }
        });

        this.telegraf.action(/location-\d/, async (ctxAction) => {
            loggerUserLevel.info(`${userId} clicked ${ctxAction['update']['callback_query']['data']}`);
            let selectedLocation: number = +(ctxAction['update']['callback_query']['data'].split('-')[1]);
            const subPoint: [number, number] = [+(ctxAction['update']['callback_query']['data'].split('-')[3]), +(ctxAction['update']['callback_query']['data'].split('-')[4])];

            // edit message, delete and send new message if edit fail
            try {
                telegramMsg = await this.telegram.editMessageText(userId, telegramMsg.message_id, null, 'Ort wird geladen...');
            } catch (e) {
                loggerUserLevel.warn("could not update (1) message: " + telegramMsg.message_id);
                try {
                    await this.telegram.deleteMessage(userId, telegramMsg.message_id);
                } catch (e) {
                    loggerUserLevel.warn("could not delete (1) message: " + telegramMsg.message_id);
                }
                telegramMsg = await ctx.reply('Ort wird geladen. Das kann bis zu 30 Sekunden dauern.');
            }

            let location;
            try {
                if (!ctx.session.locationPromisse) {
                    throw new Error();
                }
                location = await ctx.session.locationPromisse;
            } catch (e) {
                location = await this.covid19Region.findLocationForPoint(subPoint)
            }
            console.log(location);
            // location not found
            if (!location) {
                loggerUserLevel.error(`${userId} location could not be updated ${point} (long, lat)`, new Error());
                this.sendAdminMsg(`${userId} location could not be updated ${point} (long, lat)`);
                let msg = `Der Standort konnte keiner Region in Deutschland zugeordnet werden. Versuche einen anderen Standort. Für Standorte außerhalb von Deutschland habe ich leider noch keine Daten.`;
                try {
                    await ctx.reply(msg);
                } catch (e) {
                    await this.telegram.sendMessage(userId, msg);
                }
                return;
            }

            await this.follower.update(userId, location.id, selectedLocation);
            loggerUserLevel.info(`${userId} ${selectedLocation === 0 ? 'Home' : 'Work'} location updated to ${location.id}`);

            // edit message, delete and send new message if edit fail
            try {
                await this.telegram.editMessageText(userId, telegramMsg.message_id, null, `${selectedLocation === 0 ? 'Home' : 'Work'} wurde auf ${location.name} aktualisiert.`);
            } catch (e) {
                loggerUserLevel.warn("could not update (2) message: " + telegramMsg.message_id);
                await this.telegram.deleteMessage(userId, telegramMsg.message_id);
                await ctx.reply(`${selectedLocation === 0 ? 'Home' : 'Work'} wurde auf ${location.name} aktualisiert.`);
            }
            ctx.session.locationPromisse = null;
            this.sendUpdate(userId, location.id, selectedLocation);
        });
    }

    async sendUpdate(chatId: string, regionId: string, regionType: number) {
        const cases = (await this.covid19Region.getOneLocation(regionId)).cases7_per_100k;
        let warningMsg;
        let colorEmoji;

        if (cases < 20) {
            colorEmoji = '🟢';
            warningMsg = 'Aktuell ist alles im grünen Bereich ☺. Sei aber trotzdem Vorsichtig!';
        } else if (cases < 35) {
            colorEmoji = '🟡';
            warningMsg = 'Es gibt einige Fälle in deiner Region 😧. Behalte die Ampel im Blick.'
        } else if (cases < 50) {
            colorEmoji = '🟠';
            warningMsg = 'Es gibt aktuell viele Fälle in deiner Region 😷. Behalte die Nachrichten im Blick, es gibt vermutlich Einschränkungen.';
        } else {
            colorEmoji = '🔴';
            warningMsg = 'Es gibt sehr viele Fälle in deiner Region 🏘🚷. Bleibe am besten zu Hause und verfolge aktiv die Nachrichten. In deiner Region gibt es sehr wahrscheinlich Einschränkungen';
        }
        try {
            await this.telegram.sendMessage(chatId, `${regionType === 0 ? '🏠' : '🏢'} ${colorEmoji} ${cases} Fälle \n\n${warningMsg}`);
        } catch (e) {
            if (e.code === 403) {
                loggerUserLevel.info(`${chatId} removed User - ${e.description}`);
                await this.follower.remove(chatId);
            } else {
                loggerUserLevel.error('could not send message to user', e);
            }
        }
    }

    async adminUpdate() {
        try {
            await this.telegram.sendMessage(14417823, `Der Bot hat aktuell ${await this.follower.followerCount()} Abbonenten.`);
        } catch (e) {
            loggerUserLevel.error('could not send admin update', e);
        }
    }

    async sendAdminMsg(msg: string) {
        await this.telegram.sendMessage(14417823, msg);
    }

    async scheduleUpdates() {

        const jobTime = '0 8 * * *';
        const job = new CronJob(jobTime, async () => {
            loggerSystemLevel.info(`Scheduled Update started`);
            let followers = await this.follower.getAllWithLocation();
            followers.forEach(follower => {
                if (follower.regionId0) {
                    this.sendUpdate(follower.telegramId, follower.regionId0, 0);
                }
                if (follower.regionId1) {
                    this.sendUpdate(follower.telegramId, follower.regionId1, 1);
                }
            });
            this.adminUpdate();
        });
        job.start();
    }
}
