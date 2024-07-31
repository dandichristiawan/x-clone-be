import express from 'express';
import {
  getPost,
  getSinglePost,
  createPost,
  createReplies,
  getDetailPostReplies,
} from '../controllers/postController';
import { authenticateJWT } from '../middlware';

const router = express.Router();

router.get('/getPosts', getPost);
router.get('/post/:postId', getSinglePost);
router.post('/createPost', authenticateJWT, createPost);
router.post('/post/:postId/reply', authenticateJWT, createReplies);
router.get('/post/:postId/replies', getDetailPostReplies);

export default router;
