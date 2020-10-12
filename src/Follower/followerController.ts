import {FollowerModel, IFollower} from './follower';

export class FollowerController {

    public async getAllWithLocation(): Promise<IFollower[]> {
        try {
            return await FollowerModel.find({$or: [{regionId0: {$ne: null}}, {regionId1: {$ne: null}}]});
        } catch (err) {
            console.error('Caught error', err);
        }
    }

    public async create(telegramId: string, username: string): Promise<void> {
        const item = new FollowerModel({telegramId, username});
        try {
            await item.save();
        } catch (err) {
            if (err.code !== 11000) {
                console.error('Could not insert follower...');
                console.error(err)
            }
        }
    }

    public async update(id: number, regionId: string, locationType: number): Promise<void> {
        let updateData;
        if(locationType === 0){
            updateData = {regionId0: regionId}
        }else{
            updateData = {regionId1: regionId}
        }
        await FollowerModel.findOneAndUpdate({telegramId: id}, updateData);
    }

    public async remove(id: number): Promise<void> {
        await FollowerModel.findOneAndDelete({telegramId: id});
    }

    public async followerCount():Promise<number>{
        try {
            return (await FollowerModel.find()).length;
        } catch (err) {
            console.error('Caught error', err);
        }
    }
}
