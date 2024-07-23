import { Request, Response } from 'express';
import PostModel from '../models/Post';
import { db } from '../mongodb/mongodb';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export async function createPost(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { content } = req.body;

  if (!content) {
    res.status(400).json({ message: 'Content is Required' });
  }

  try {
    const newPost = new PostModel({
      user: req.user?.userId,
      content,
    });

    await newPost.save();
    res.status(200).json({ message: 'Post successfully created' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function getPost(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const posts = await PostModel.find()
      .populate({
        path: 'user', 
        select: 'username',
      })
      .exec();

    res.status(200).json(posts);
  } catch (error) {
    console.error('Failed to fetch', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
}
