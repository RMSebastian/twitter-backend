
export class FollowDTO{

    id: string
    followerId: string;
    followedId: string;

    constructor(follow: FollowDTO){
        this.id = follow.id;
        this.followerId = follow.followerId;
        this.followedId = follow.followedId;
    }
}