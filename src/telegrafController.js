"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var telegraf_1 = require("telegraf");
var covid19RegionController_1 = require("./Covid19Region/covid19RegionController");
var followerController_1 = require("./Follower/followerController");
var CronJob = require('cron').CronJob;
var nodeBot = require('telegraf');
var session = require('telegraf/session');
var logger_1 = require("./logger");
var TelegrafController = /** @class */ (function () {
    function TelegrafController() {
        if (process.env.BOT_TOKEN === undefined)
            throw new Error("BOT_TOKEN is undefined");
        this.telegram = new telegraf_1.Telegram(process.env.BOT_TOKEN);
        this.covid19Region = new covid19RegionController_1.Covid19RegionsController();
        this.follower = new followerController_1.FollowerController();
        this.main();
        this.scheduleUpdates();
    }
    TelegrafController.prototype.main = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.telegraf = new nodeBot(process.env.BOT_TOKEN);
                        this.telegraf.use(session());
                        this.telegram = new telegraf_1.Telegram(process.env.BOT_TOKEN);
                        this.telegraf.start(function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        ctx.session.locationPromisse = null;
                                        logger_1.loggerUserLevel.info(ctx.update.message.from.id + " new User");
                                        ctx.reply("Willkommen " + ctx.update.message.from.first_name + ",\n\n1\uFE0F\u20E3 Sende mir deinen Standort oder den Standort der Region zu, von der du Covid19 Statistiken erhalten m\u00F6chtest.\n\n2\uFE0F\u20E3 Erhalte t\u00E4glich ein Update.\n\n\u2705 Du kannst die Region jederzeit \u00E4ndern.");
                                        return [4 /*yield*/, this.follower.create(ctx.update.message.from.id, ctx.update.message.from.first_name ? ctx.update.message.from.first_name : ctx.update.message.from.username)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        this.telegraf.command('quelle', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                logger_1.loggerUserLevel.info(ctx.update.message.from.id + " command 'quelle'");
                                ctx.replyWithHTML("Die Daten sind die „Fallzahlen in Deutschland“ des <a href='https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Fallzahlen.html'>Robert Koch-Institut (RKI)</a> \n\n" +
                                    "Quellenvermerk: Robert Koch-Institut (RKI), dl-de/by-2-0 \n" +
                                    "API: <a href='https://npgeo-corona-npgeo-de.hub.arcgis.com/datasets/dd4580c810204019a7b8eb3e0b329dd6_0'>NPGEO Corona</a>");
                                return [2 /*return*/];
                            });
                        }); });
                        this.telegraf.command('update', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                logger_1.loggerUserLevel.info(ctx.update.message.from.id + " command 'update'");
                                ctx.reply('Sende mir einfach wieder einen Standort um deine Region zu ändern.');
                                return [2 /*return*/];
                            });
                        }); });
                        this.telegraf.command('info', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                logger_1.loggerUserLevel.info(ctx.update.message.from.id + " command 'info'");
                                ctx.replyWithHTML('<u>Fälle</u>: Die Zahl gibt die neuen Infektionen der letzten 7 Tage auf 100.000 Einwohner an. Anhand dieses Wertes beschließen die jeweiligen Regionen die aktuellen Einschränkungen und ihr weiteres Vorgehen. \n\nDiese Ampel soll die Zahl verbildlichen. Sie wird auch für dein Tägliches Update verwendet.\n🔴 50+ 🏘🚷\n🟠 35 bis 50 😷\n🟡 20 bis 35 😧\n🟢 0 bis 20 ☺');
                                return [2 /*return*/];
                            });
                        }); });
                        this.telegraf.on('location', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                if (ctx.session.locationPromisse !== undefined && ctx.session.locationPromisse !== null) {
                                    ctx.reply('Eine andere Aktion wartet noch auf deine Antwort.');
                                    // console.log(ctx.session.locationPromisse);
                                    return [2 /*return*/];
                                }
                                this.locationUpdateHandling(ctx);
                                return [2 /*return*/];
                            });
                        }); });
                        return [4 /*yield*/, this.telegraf.launch()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TelegrafController.prototype.locationUpdateHandling = function (ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, point, telegramMsg;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userId = ctx.update.message.from.id;
                        point = [ctx.update.message.location.longitude, ctx.update.message.location.latitude];
                        logger_1.loggerUserLevel.info(userId + " send new location: " + point);
                        ctx.session.locationPromisse = this.covid19Region.findLocationForPoint(point);
                        return [4 /*yield*/, this.telegram.sendMessage(userId, 'Als was möchtest du diesen Ort festlegen?', {
                                reply_markup: {
                                    inline_keyboard: [[
                                            { text: 'Home 🏠', callback_data: "location-0-" + userId + "-" + point[0] + "-" + point[1] },
                                            { text: 'Work 🏢', callback_data: "location-1-" + userId + "-" + point[0] + "-" + point[1] }
                                        ]]
                                }
                            })];
                    case 1:
                        telegramMsg = _a.sent();
                        this.telegraf.action(/location-\d/, function (ctxAction) { return __awaiter(_this, void 0, void 0, function () {
                            var selectedLocation, subPoint, e_1, location, e_2, e_3, e_4;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        selectedLocation = +(ctxAction['update']['callback_query']['data'].split('-')[1]);
                                        subPoint = [+(ctxAction['update']['callback_query']['data'].split('-')[3]), +(ctxAction['update']['callback_query']['data'].split('-')[4])];
                                        console.log(subPoint);
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 3, , 6]);
                                        return [4 /*yield*/, this.telegram.editMessageText(userId, telegramMsg.message_id, null, 'Ort wird geladen...')];
                                    case 2:
                                        telegramMsg = _a.sent();
                                        return [3 /*break*/, 6];
                                    case 3:
                                        e_1 = _a.sent();
                                        return [4 /*yield*/, this.telegram.deleteMessage(userId, telegramMsg.message_id)];
                                    case 4:
                                        _a.sent();
                                        return [4 /*yield*/, ctx.reply('Ort wird geladen...')];
                                    case 5:
                                        telegramMsg = _a.sent();
                                        return [3 /*break*/, 6];
                                    case 6:
                                        _a.trys.push([6, 8, , 10]);
                                        if (!ctx.session.locationPromisse) {
                                            throw new Error();
                                        }
                                        return [4 /*yield*/, ctx.session.locationPromisse];
                                    case 7:
                                        location = _a.sent();
                                        return [3 /*break*/, 10];
                                    case 8:
                                        e_2 = _a.sent();
                                        return [4 /*yield*/, this.covid19Region.findLocationForPoint(subPoint)];
                                    case 9:
                                        location = _a.sent();
                                        return [3 /*break*/, 10];
                                    case 10:
                                        console.log(location);
                                        if (!!location) return [3 /*break*/, 16];
                                        logger_1.loggerUserLevel.error(userId + " location could not be updated " + point + " (long, lat)", new Error());
                                        this.sendAdminMsg(userId + " location could not be updated " + point + " (long, lat)");
                                        _a.label = 11;
                                    case 11:
                                        _a.trys.push([11, 13, , 15]);
                                        return [4 /*yield*/, ctx.reply("Der Standort konnte keiner Region zugeordnet werden. Versuche einen anderen Standort.")];
                                    case 12:
                                        _a.sent();
                                        return [3 /*break*/, 15];
                                    case 13:
                                        e_3 = _a.sent();
                                        return [4 /*yield*/, this.telegram.sendMessage(userId, "Der Standort konnte keiner Region zugeordnet werden. Versuche einen anderen Standort.")];
                                    case 14:
                                        _a.sent();
                                        return [3 /*break*/, 15];
                                    case 15: return [2 /*return*/];
                                    case 16: return [4 /*yield*/, this.follower.update(userId, location.id, selectedLocation)];
                                    case 17:
                                        _a.sent();
                                        logger_1.loggerUserLevel.info(userId + " " + (selectedLocation === 0 ? 'Home' : 'Work') + " location updated to " + location.id);
                                        _a.label = 18;
                                    case 18:
                                        _a.trys.push([18, 20, , 23]);
                                        return [4 /*yield*/, this.telegram.editMessageText(userId, telegramMsg.message_id, null, (selectedLocation === 0 ? 'Home' : 'Work') + " wurde auf " + location.name + " aktualisiert.")];
                                    case 19:
                                        _a.sent();
                                        return [3 /*break*/, 23];
                                    case 20:
                                        e_4 = _a.sent();
                                        return [4 /*yield*/, this.telegram.deleteMessage(userId, telegramMsg.message_id)];
                                    case 21:
                                        _a.sent();
                                        return [4 /*yield*/, ctx.reply((selectedLocation === 0 ? 'Home' : 'Work') + " wurde auf " + location.name + " aktualisiert.")];
                                    case 22:
                                        _a.sent();
                                        return [3 /*break*/, 23];
                                    case 23:
                                        ctx.session.locationPromisse = null;
                                        this.sendUpdate(userId, location.id, selectedLocation);
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [2 /*return*/];
                }
            });
        });
    };
    TelegrafController.prototype.sendUpdate = function (chatId, regionId, regionType) {
        return __awaiter(this, void 0, void 0, function () {
            var cases, warningMsg, colorEmoji, e_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.covid19Region.getOneLocation(regionId)];
                    case 1:
                        cases = (_a.sent()).cases7_per_100k;
                        if (cases < 20) {
                            colorEmoji = '🟢';
                            warningMsg = 'Aktuell ist alles im grünen Bereich ☺. Sei aber trotzdem Vorsichtig!';
                        }
                        else if (cases < 35) {
                            colorEmoji = '🟡';
                            warningMsg = 'Es gibt einige Fälle in deiner Region 😧. Behalte die Ampel im Blick.';
                        }
                        else if (cases < 50) {
                            colorEmoji = '🟠';
                            warningMsg = 'Es gibt aktuell viele Fälle in deiner Region 😷. Behalte die Nachrichten im Blick, es gibt vermutlich Einschränkungen.';
                        }
                        else {
                            colorEmoji = '🔴';
                            warningMsg = 'Es gibt sehr viele Fälle in deiner Region 🏘🚷. Bleibe am besten zu Hause und verfolge aktiv die Nachrichten. In deiner Region gibt es sehr wahrscheinlich Einschränkungen';
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 8]);
                        return [4 /*yield*/, this.telegram.sendMessage(chatId, (regionType === 0 ? '🏠' : '🏢') + " " + colorEmoji + " " + cases + " F\u00E4lle \n\n" + warningMsg)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 4:
                        e_5 = _a.sent();
                        if (!(e_5.code === 403)) return [3 /*break*/, 6];
                        logger_1.loggerUserLevel.info(chatId + " removed User - " + e_5.description);
                        return [4 /*yield*/, this.follower.remove(chatId)];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        logger_1.loggerUserLevel.error('could not send message to user', e_5);
                        _a.label = 7;
                    case 7: return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    TelegrafController.prototype.adminUpdate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, _d, e_6;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 3, , 4]);
                        _b = (_a = this.telegram).sendMessage;
                        _c = [14417823];
                        _d = "Der Bot hat aktuell ";
                        return [4 /*yield*/, this.follower.followerCount()];
                    case 1: return [4 /*yield*/, _b.apply(_a, _c.concat([_d + (_e.sent()) + " Abbonenten."]))];
                    case 2:
                        _e.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_6 = _e.sent();
                        logger_1.loggerUserLevel.error('could not send admin update', e_6);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    TelegrafController.prototype.sendAdminMsg = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.telegram.sendMessage(14417823, msg)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TelegrafController.prototype.scheduleUpdates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var jobTime, job;
            var _this = this;
            return __generator(this, function (_a) {
                jobTime = '0 8 * * *';
                job = new CronJob(jobTime, function () { return __awaiter(_this, void 0, void 0, function () {
                    var followers;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                logger_1.loggerSystemLevel.info("Scheduled Update started");
                                return [4 /*yield*/, this.follower.getAllWithLocation()];
                            case 1:
                                followers = _a.sent();
                                followers.forEach(function (follower) {
                                    if (follower.regionId0) {
                                        _this.sendUpdate(follower.telegramId, follower.regionId0, 0);
                                    }
                                    if (follower.regionId1) {
                                        _this.sendUpdate(follower.telegramId, follower.regionId1, 1);
                                    }
                                });
                                this.adminUpdate();
                                return [2 /*return*/];
                        }
                    });
                }); });
                job.start();
                return [2 /*return*/];
            });
        });
    };
    return TelegrafController;
}());
exports.TelegrafController = TelegrafController;
