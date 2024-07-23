import express from 'express';
import { createPost, getPost } from '../controllers/postController';
import { authenticateJWT } from '../middlware';

const router = express.Router();

router.post('/createPost', authenticateJWT, createPost);
router.get('/getPosts', getPost);

export default router;
