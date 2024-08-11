import { ReactionType } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';
export class CreateReactionInputDTO {
  @IsEnum(ReactionType)
  @IsNotEmpty()
  type!: ReactionType;
}
export class ReactionDTO {
  id: string;
  createdAt: Date;
  userId: string;
  postId: string;
  updatedAt: Date;
  type: ReactionType;

  constructor(reaction: ReactionDTO) {
    this.userId = reaction.userId;
    this.postId = reaction.postId;
    this.type = reaction.type;
    this.id = reaction.id;
    this.createdAt = reaction.createdAt;
    this.updatedAt = reaction.updatedAt;
  }
}
