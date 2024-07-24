import { User } from './User';
import { getModelForClass, prop, Ref } from '@typegoose/typegoose';

class Post {
  @prop({ required: true, ref: () => User })
  public user!: Ref<User>;

  @prop({ required: true })
  public content!: string;

  @prop({ default: Date.now })
  public createdAt?: Date;

  @prop({ default: 0 })
  public likes?: number;

  @prop({ ref: () => Replies })
  public replies: Ref<Replies>[] = [];

}

class Replies {
  @prop({ required: true, ref: () => User })
  public user!: Ref<User>;

  @prop({ required: true })
  public reply!: string;

  @prop({ default: Date.now })
  public createdAt?: Date;

  @prop({ ref: () => Post })
  public post!: Ref<Post>;
}

export const RepliesModel = getModelForClass(Replies);
export const PostModel = getModelForClass(Post);

