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
var request = require('request');
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
                                        logger_1.loggerUserLevel.info(ctx.update.message.from.id + " new User");
                                        ctx.reply("Willkommen " + ctx.update.message.from.first_name + ",\n\n1\uFE0F\u20E3 Sende mir deinen Standort oder den Standort der Region zu, von der du Covid19 Statistiken erhalten m\u00F6chtest.\n\n2\uFE0F\u20E3 Erhalte t\u00E4glich ein Update.\n\n\u2705 Du kannst die Region jederzeit \u00E4ndern.");
                                        return [4 /*yield*/, this.follower.create(ctx.update.message.from.id)];
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
                                ctx.reply('Comming soon! \n🔴 50+ 🏘🚷\n🟠 35 bis 50 😷\n🟡 20 bis 35 😧\n🟢 0 bis 20 ☺');
                                return [2 /*return*/];
                            });
                        }); });
                        this.telegraf.on('location', function (ctx) { return __awaiter(_this, void 0, void 0, function () {
                            var location;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        logger_1.loggerUserLevel.info(ctx.update.message.from.id + " send new location");
                                        ctx.reply('Ort wird geladen...');
                                        return [4 /*yield*/, this.covid19Region.findLocationForPoint([ctx.update.message.location.longitude, ctx.update.message.location.latitude])];
                                    case 1:
                                        location = _a.sent();
                                        if (!location) {
                                            logger_1.loggerUserLevel.error(ctx.update.message.from.id + " location could not be updated [" + ctx.update.message.location.longitude + ", " + ctx.update.message.location.latitude + "] (long, lat)", new Error());
                                            ctx.reply("Der Standort konnte keiner Region zugeordnet werden. Versuche einen anderen Standort.");
                                            return [2 /*return*/];
                                        }
                                        return [4 /*yield*/, this.follower.update(ctx.update.message.from.id, location.id)];
                                    case 2:
                                        _a.sent();
                                        return [4 /*yield*/, ctx.reply("Dein Ort wurde auf " + location.name + " aktualisiert.")];
                                    case 3:
                                        _a.sent();
                                        logger_1.loggerUserLevel.info(ctx.update.message.from.id + " location updated to " + location.id);
                                        this.sendUpdate(ctx.update.message.from.id, location.id);
                                        return [2 /*return*/];
                                }
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
    TelegrafController.prototype.sendUpdate = function (chatId, regionId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _b = (_a = this.telegram).sendMessage;
                        _c = [chatId];
                        return [4 /*yield*/, this.covid19Region.getOneLocation(regionId)];
                    case 1:
                        _b.apply(_a, _c.concat([(_d.sent()).cases7_per_100k + " F\u00E4lle auf 100.000 Einwohner in den letzten 7 Tagen."]));
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
                    var follower;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                logger_1.loggerSystemLevel.info("Scheduled Update started");
                                return [4 /*yield*/, this.follower.getAllWithLocation()];
                            case 1:
                                follower = _a.sent();
                                follower.forEach(function (follower) {
                                    _this.sendUpdate(follower.telegramId, follower.regionId);
                                });
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
