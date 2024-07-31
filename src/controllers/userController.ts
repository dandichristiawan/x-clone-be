import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models';
import { db } from '../mongodb/mongodb';
import { Request, Response } from 'express';
import { Types } from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export async function signUpUser(req: Request, res: Response): Promise<void> {
  const { fullname, username, email, password } = req.body;
  if (!fullname || !username || !email || !password) {
    res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const usersCollection = db.collection('users');
    const userExist = await usersCollection.findOne({ email });

    if (userExist) {
      res.status(400).json({ message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      fullname,
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
  }

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user?.password) {
      res.status(500).json({ message: 'User password not found' });
    }

    const isMatch = await bcrypt.compare(password, user?.password as string);

    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
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
        fullname: user?.fullname,
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

export async function getUserProfile(req: Request, res: Response): Promise<void> {
  const { username } = req.params;

  if (!username) {
    res.status(400).json({ message: 'Username are required' });
  }

  try {
    const user = await UserModel.findOne({ username: username })
      .select('username fullname posts following followers likes createdAt')
      .populate('following', 'username')
      .populate('followers', 'username')
      .exec()
    if (!user) {
      res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
}

export async function getUserPost(req: Request, res: Response): Promise<void> {
  const { username } = req.params;

  if (!username) {
    res.status(400).json({ message: 'Username are required' })
  }

  try {
    const user = await UserModel.findOne({ username: username })
      .select('posts')
      .populate('posts')
      .exec()
    if (!user) {
      res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }

}

export async function unfollowUser(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { userIdToUnfollow } = req.body;

  if (!userIdToUnfollow) {
    res.status(400).json({ message: 'User ID to unfollow is required' });
  }

  // if (userIdToUnfollow === req.user.userId) {
  //   res.status(400).json({ message: 'You cannot unfollow yourself' });
  // }

  try {
    const currentUser = await UserModel.findById(req.user.userId);
    const userToUnfollow = await UserModel.findById(userIdToUnfollow);

    if (!currentUser || !userToUnfollow) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (!currentUser.following.includes(userIdToUnfollow)) {
      res.status(400).json({ message: 'You are not following this user' });
      return;
    }

    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== userIdToUnfollow
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== currentUser._id.toString()
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.status(200).json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Failed to unfollow user', error);
    res.status(500).json({ message: 'Failed to unfollow user' });
  }
}

export async function followUser(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { userIdToFollow } = req.body;
  console.log('ini user id yg mau di follow: ', userIdToFollow);

  if (!userIdToFollow) {
    res.status(400).json({ message: 'User ID to follow is required' });
  }

  if (req.user?.userId === userIdToFollow) {
    res.status(400).json({ message: 'You cannot follow yourself' });
  }

  try {
    const currentUser = await UserModel.findById(req.user?.userId);
    const userToFollow = await UserModel.findById(userIdToFollow);

    if (!currentUser || !userToFollow) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (currentUser.following.includes(userIdToFollow)) {
      res.status(400).json({ message: 'You are already following this user' });
      return;
    }

    currentUser.following.push(userIdToFollow);
    userToFollow.followers.push(currentUser._id);

    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Failed to follow user', error);
    res.status(500).json({ message: 'Failed to follow user' });
  }
}

export async function checkFollowStatus(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userIdToCheck = req.query.userIdToCheck as string

  if (!userIdToCheck) {
    res.status(400).json({ message: 'User ID to check follow status is required' });
  }

  try {
    const currentUser = await UserModel.findById(req.user?.userId);

    if (!currentUser) {
      res.status(404).json({ message: 'User not found' });
      return
    }

    const userIdToCheckObjectId = new Types.ObjectId(userIdToCheck)
    const isFollowing = currentUser.following.includes(userIdToCheckObjectId)

    res.status(200).json({ isFollowing })

  } catch (error) {
    console.error('Failed to check follow status', error);
    res.status(500).json({ message: 'Failed to check follow status' });
  }

}