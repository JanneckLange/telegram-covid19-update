import * as mongoose from 'mongoose';
import {TelegrafController} from './telegrafController';
import {loggerMongoLevel} from './logger';

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
        this.url = `mongodb://${this.mongoUser}:${this.mongoPassword}@${this.mongoUrl}:${this.mongoPort}/admin`;
        loggerMongoLevel.info(this.url);

        this.init();
    }

    async init() {
        mongoose.connect(this.url, Start.mongoOptions);
        mongoose.connection.on('open', () => {
            loggerMongoLevel.info('Connected to Mongo.');
        });
        mongoose.connection.on('error', (err: any) => {
            loggerMongoLevel.error('Mongo connection error', err);
        });
        new TelegrafController();
    }
}

new Start();
