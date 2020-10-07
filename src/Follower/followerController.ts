import {FollowerModel, IFollower} from './follower';

export class FollowerController {

    public async getAllWithLocation(): Promise<IFollower[]> {
        try {
            return await FollowerModel.find({$and: [{regionId: {$ne: null}}, {regionId: {$ne: ''}}]});
        } catch (err) {
            console.error('Caught error', err);
        }
    }

    public async create(telegramId: string): Promise<void> {
        const item = new FollowerModel({telegramId});
        try {
            await item.save();
        } catch (err) {
            if (err.code !== 11000) {
                console.error('Could not insert follower...')
                console.error(err)
            }
        }
    }

    public async update(id: string, regionId: string): Promise<void> {
        await FollowerModel.findOneAndUpdate({telegramId: id}, {regionId: regionId});
    }

    public async remove(id: string): Promise<void> {
        await FollowerModel.findOneAndDelete({telegramId: id});
    }
}
