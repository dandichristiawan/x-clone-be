import express from 'express';
import {
  getAllUsers,
  signUpUser,
  Login,
  getUserProfile,
  followUser,
  unfollowUser,
  getUserPost
} from '../controllers/userController';
import { authenticateJWT } from '../middlware';

const router = express.Router();

router.get('/users', getAllUsers);
router.post('/signup', signUpUser);
router.post('/login', Login);
router.get('/user/:username', getUserProfile);
router.get('/userPost/:username', getUserPost)
router.post('/followUser', authenticateJWT, followUser)
router.post('/unfollowUser', authenticateJWT, unfollowUser)

export default router;
