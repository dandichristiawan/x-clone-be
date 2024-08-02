import express from 'express';
import {
  getPost,
  getSinglePost,
  createPost,
  createReplies,
  likeUnlikePost,
  getLikedPost,
  getDetailPostReplies,
} from '../controllers/postController';
import { authenticateJWT } from '../middlware';

const router = express.Router();

router.get('/getPosts', getPost);
router.get('/post/:postId', getSinglePost);
router.get('/likes/:username', getLikedPost);
router.post('/createPost', authenticateJWT, createPost);
router.get('/post/:postId/replies', getDetailPostReplies);
router.post('/post/like-events', authenticateJWT, likeUnlikePost);
router.post('/post/:postId/reply', authenticateJWT, createReplies);

export default router;
