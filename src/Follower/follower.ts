import * as mongoose from 'mongoose';

interface IFollower {
    _id: string;
    telegramId: string;
    regionId?: string
}

const FollowerSchema = new mongoose.Schema({
    telegramId: {
        type: Number,
        required: true,
        unique: true
    },
    regionId: String,
});

const FollowerModel = mongoose.model('Follower', FollowerSchema);

export {FollowerModel, IFollower}
