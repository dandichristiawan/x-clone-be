import { getModelForClass, prop, Ref } from '@typegoose/typegoose';
import { User } from './User';

class Post {
  @prop({ required: true, ref: () => User })
  public user!: Ref<User>;

  @prop({ required: true })
  public content!: string;

  @prop({ default: Date.now })
  public createdAt?: Date;

  @prop({ default: 0 })
  public likes?: number;
}

const PostModel = getModelForClass(Post);
export default PostModel;
