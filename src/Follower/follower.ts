import * as mongoose from 'mongoose';

interface IFollower {
    _id: string;
    telegramId: number;
    username: string
    regionId0?: string
    regionId1?: string
}

const FollowerSchema = new mongoose.Schema({
    telegramId: {
        type: Number,
        required: true,
        unique: true
    },
    username: String,
    regionId0: String,
    regionId1: String,
});

const FollowerModel = mongoose.model('Follower', FollowerSchema);

export {FollowerModel, IFollower}
