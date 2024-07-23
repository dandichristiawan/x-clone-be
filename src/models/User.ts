import { getModelForClass, prop } from "@typegoose/typegoose";

class User {
    @prop({ required: true })
    public name!: string

    @prop({ required: true, unique: true })
    public email!: string;

    @prop({ required: true })
    public password!: string;
}

const UserModel = getModelForClass(User);
export default UserModel;
