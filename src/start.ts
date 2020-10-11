import * as mongoose from 'mongoose';
import {TelegrafController} from './telegrafController';

class Start {

    private readonly mongoUrl;
    private readonly dbName;
    private readonly mongoPort;
    private readonly url;
    private readonly mongoUser;
    private readonly mongoPassword;
    private static readonly mongoOptions = {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useCreateIndex: true,
    };

    constructor(mongoUrl: string = process.env.DB_URL, dbName: string = process.env.DB_NAME, mongoPort: string = process.env.DB_PORT, mongoUser: string = process.env.DB_USER, mongoPw: string = process.env.DB_PASS) {
        this.mongoUrl = mongoUrl;
        this.dbName = dbName;
        this.mongoPort = mongoPort;
        this.mongoUser = mongoUser;
        this.mongoPassword = mongoPw;
        this.url = `mongodb://${this.mongoUser}:${this.mongoPassword}@${this.mongoUrl}:${this.mongoPort}/${this.dbName}`;

        this.init();
        // this.handleShutdown();
    }

    async init() {
        mongoose.connect(this.url, Start.mongoOptions);
        mongoose.connection.on('open', () => {
            console.info('Connected to Mongo.');
        });
        mongoose.connection.on('error', (err: any) => {
            console.error(err);
        });
        new TelegrafController();
    }

    async handleShutdown() {
        process.stdin.resume();

        const signals = {
            'uncaughtException': -1,
            'exit': 0,
            'SIGHUP': 1,
            'SIGINT': 2,
            'SIGTERM': 15,
            'SIGUSR1': 98,
            'SIGUSR2': 98
        };
        Object.keys(signals).forEach((signal) => {
            process.on(signal, () => {
                console.log(`process received a ${signal} signal`);
                console.log('Exit with ' + signals[signal]);
                process.exit();
            });
        });
    }
}

new Start();
