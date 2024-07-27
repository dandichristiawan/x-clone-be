import { getModelForClass, prop, Ref } from '@typegoose/typegoose';

class User {
  @prop({ required: true })
  public fullname!: string;

  @prop({ required: true, unique: true })
  public username!: string;

  @prop({ required: true, unique: true })
  public email!: string;

  @prop({ required: true })
  public password!: string;

  @prop({ default: Date.now })
  public createdAt?: Date;

  @prop({ ref: () => Post })
  public posts: Ref<Post>[] = [];

  @prop({ ref: () => User })
  public following: Ref<User>[] = [];

  @prop({ ref: () => User })
  public followers: Ref<User>[] = [];

  @prop({ ref: () => Post })
  public likes: Ref<Post>[] = [];
}

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

export const UserModel = getModelForClass(User);
export const RepliesModel = getModelForClass(Replies);
export const PostModel = getModelForClass(Post);
