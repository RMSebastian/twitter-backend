import { ReactionType } from '@enums';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'
export class CreateReactionInputDTO{
    @IsEnum(ReactionType)
    @IsNotEmpty()
        type!: ReactionType
}
export class ReactionDTO{
    @IsString() 
    @IsNotEmpty()
        userId: string;

    @IsString()
    @IsNotEmpty()
        postId: string

    @IsEnum(ReactionType)
    @IsNotEmpty()
        type: ReactionType

    constructor(reaction: ReactionDTO){
        this.userId = reaction.userId;
        this.postId = reaction.postId;
        this.type = reaction.type;
    }
}