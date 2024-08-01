import { Request, Response } from 'express';
import { db } from '../mongodb/mongodb';
import { PostModel, RepliesModel, UserModel, Post } from '../models';
import { Ref } from '@typegoose/typegoose';

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

    const currentUser = await UserModel.findById(req.user.userId);
    if (currentUser) {
      currentUser.posts.push(newPost._id);
      await currentUser.save();
    }

    res
      .status(200)
      .json({ message: 'Post successfully created', postId: newPost._id });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function likePost(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { postId } = req.body;

  if (!postId) {
    res.status(400).json({ message: 'Post ID are required' });
  }

  try {
    const userId = req.user?.userId;

    const user = await UserModel.findById(userId);
    const post = await PostModel.findById(postId);

    if (!user || !post) {
      res.status(404).json({ message: 'User or Post not found' });
      return;
    }

    if (!user.likes.includes(postId as unknown as Ref<Post>)) {
      user.likes.push(postId as unknown as Ref<Post>);
      post.likes = (post?.likes || 0) + 1;

      await user.save();
      await post.save();

      res.status(200).json({ message: 'Post liked successfully' });
    } else {
      res.status(400).json({ message: 'Post already liked' });
    }
  } catch (error) {
    console.error('Failed to like post', error);
    res.status(500).json({ message: 'Failed to like post' });
  }
}

export async function unlikePost(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { postId } = req.body;

  if (!postId) {
    res.status(400).json({ message: 'Post ID are required' });
  }

  try {
    const userId = req.user?.userId;

    const user = await UserModel.findById(userId);
    const post = await PostModel.findById(postId);

    if (!user || !post) {
      res.status(404).json({ message: 'User or Post not found' });
      return;
    }

    const likeIndex = user.likes.indexOf(postId as unknown as Ref<Post>);
    if (likeIndex > -1) {
      user.likes.splice(likeIndex, 1);
      post.likes = (post.likes || 0) - 1;

      await user.save();
      await post.save();

      res.status(200).json({ message: 'Post unliked successfully' });
    } else {
      res.status(400).json({ message: 'Post not liked yet' });
    }
  } catch (error) {
    console.error('Failed to unlike post', error);
    res.status(500).json({ message: 'Failed to unlike post' });
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
        select: 'username fullname',
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
        select: 'username fullname',
      })
      .exec();
    res.status(200).json(post);
  } catch (error) {
    console.error('Failed to fetch', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
}

export async function getLikedPost(req: Request, res: Response): Promise<void> {
  const { username } = req.params;

  if (!username) {
    res.status(400).json({ message: 'Username are required' });
  }

  try {
    const userLikes = await UserModel.findOne({ username: username })
      .select('likes')
      .populate({
        path: 'likes',
        populate: {
          path: 'user',
          select: 'username fullname',
        },
      })
      .exec();

    if (!userLikes) {
      res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(userLikes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
}

export async function getDetailPostReplies(
  req: Request,
  res: Response
): Promise<void> {
  const { postId } = req.params;
  if (!postId) {
    res.status(400).json({ message: 'Post id are required' });
  }

  try {
    const reply = await PostModel.findById(postId)
      .select('replies')
      .populate({
        path: 'replies',
        options: { sort: { createdAt: -1 } },
        populate: {
          path: 'user',
          select: 'username fullname',
        },
      })
      .exec();

    res.status(200).json(reply);
  } catch (error) {
    console.error('Failed to fetch', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
}
