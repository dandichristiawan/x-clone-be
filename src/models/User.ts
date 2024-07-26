import { getModelForClass, prop } from '@typegoose/typegoose';

export class User {
  @prop({ required: true })
  public fullname!: string;

  @prop({ required: true })
  public username!: string;

  @prop({ required: true, unique: true })
  public email!: string;

  @prop({ required: true })
  public password!: string;
}

const UserModel = getModelForClass(User);
export default UserModel;
