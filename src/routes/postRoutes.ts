import express from 'express';
import {
  getPost,
  getSinglePost,
  createPost,
  createReplies,
  likePost,
  unlikePost,
  getLikedPost,
  getDetailPostReplies,
} from '../controllers/postController';
import { authenticateJWT } from '../middlware';

const router = express.Router();

router.get('/getPosts', getPost);
router.get('/post/:postId', getSinglePost);
router.post('/createPost', authenticateJWT, createPost);
router.post('/post/:postId/reply', authenticateJWT, createReplies);
router.get('/post/:postId/replies', getDetailPostReplies);
router.post('/post/like', authenticateJWT, likePost);
router.post('/post/unlike', authenticateJWT, unlikePost);
router.get('/likes/:username', getLikedPost);

export default router;
