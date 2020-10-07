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
var mongoose = require("mongoose");
var telegrafController_1 = require("./telegrafController");
var Start = /** @class */ (function () {
    function Start(mongoUrl, dbName, mongoPort) {
        if (mongoUrl === void 0) { mongoUrl = process.env.DB_URL; }
        if (dbName === void 0) { dbName = process.env.DB_NAME; }
        if (mongoPort === void 0) { mongoPort = process.env.DB_PORT; }
        this.mongoUrl = mongoUrl;
        this.dbName = dbName;
        this.mongoPort = mongoPort;
        this.url = "mongodb://" + this.mongoUrl + ":" + this.mongoPort + "/" + this.dbName;
        this.init();
        // this.handleShutdown();
    }
    Start.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                mongoose.connect(this.url, Start.mongoOptions);
                mongoose.connection.on('open', function () {
                    console.info('Connected to Mongo.');
                });
                mongoose.connection.on('error', function (err) {
                    console.error(err);
                });
                new telegrafController_1.TelegrafController();
                return [2 /*return*/];
            });
        });
    };
    Start.prototype.handleShutdown = function () {
        return __awaiter(this, void 0, void 0, function () {
            var signals;
            return __generator(this, function (_a) {
                process.stdin.resume();
                signals = {
                    'uncaughtException': -1,
                    'exit': 0,
                    'SIGHUP': 1,
                    'SIGINT': 2,
                    'SIGTERM': 15,
                    'SIGUSR1': 98,
                    'SIGUSR2': 98
                };
                Object.keys(signals).forEach(function (signal) {
                    process.on(signal, function () {
                        console.log("process received a " + signal + " signal");
                        console.log('Exit with ' + signals[signal]);
                        process.exit();
                    });
                });
                return [2 /*return*/];
            });
        });
    };
    Start.mongoOptions = {
        useNewUrlParser: true,
        useFindAndModify: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    };
    return Start;
}());
new Start();