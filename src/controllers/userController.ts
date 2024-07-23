import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/User';
import { db } from '../mongodb/mongodb';
import { Request, Response } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export async function signUpUser(req: Request, res: Response): Promise<void> {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }
  try {
    const usersCollection = db.collection('users');
    const userExist = await usersCollection.findOne({ email });

    if (userExist) {
      res.status(400).json({ message: 'Email is already registered' });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(200).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Failed to sign up user', error);
    res.status(500).json({ message: 'Failed to sign up user!' });
  }
}

export async function Login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required!' });
    return;
  }

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    if (!user?.password) {
      res.status(500).json({ message: 'User password not found' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user?.password as string);

    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign({ userId: user?._id }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user?._id,
        username: user?.username,
        email: user?.email,
      },
    });
  } catch (error) {
    console.error('Failed to Login user', error);
    res.status(500).json({
      message: 'Failed to log in user',
    });
  }
}

export async function getAllUsers(req: Request, res: Response): Promise<void> {
  try {
    const userCollection = db.collection('users');
    const users = await userCollection.find().toArray();
    res.status(200).json(users);
  } catch (error) {
    console.error('Failed to fetch users', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
}
