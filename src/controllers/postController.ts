import { Request, Response } from 'express';
import { db } from '../mongodb/mongodb';
import { PostModel, RepliesModel } from '../models/Post';

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

export async function createReplies(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { postId } = req.params;
  const { reply } = req.body;

  if (!reply || !postId) {
    console.log('>masuk reply', reply);
    console.log('>masuk post id', postId);
    res.status(400).json({ message: 'Reply and postId are required' });
    return;
  }

  try {
    const post = await PostModel.findById(postId);

    if (!post) {
      res.status(404).json({ message: 'Post not found' });
    }

    const newReply = new RepliesModel({
      user: req.user?.userId,
      reply,
      post: postId,
    });

    await newReply.save();

    post?.replies.push(newReply);
    await post?.save();

    res.status(200).json({ message: 'Reply successfully created' });
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
      .sort({ createdAt: -1 })
      .exec();

    res.status(200).json(posts);
  } catch (error) {
    console.error('Failed to fetch', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
}

export async function getSinglePost(
  req: Request,
  res: Response
): Promise<void> {
  const { postId } = req.params;
  try {
    const post = await PostModel.findById(postId)
      .populate({
        path: 'user',
        select: 'username',
      })
      .populate({
        path: 'replies',
        populate: {
          path: 'user',
          select: 'username',
        },
        select: 'reply',
      })
      .exec();
    res.status(200).json(post);
  } catch (error) {
    console.error('Failed to fetch', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
}
