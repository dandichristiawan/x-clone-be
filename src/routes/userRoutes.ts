import express from 'express';
import {
  getAllUsers,
  signUpUser,
  Login,
  getOneUser,
  followUser,
  unfollowUser
} from '../controllers/userController';
import { authenticateJWT } from '../middlware';

const router = express.Router();

router.get('/users', getAllUsers);
router.post('/signup', signUpUser);
router.post('/login', Login);
router.get('/user/:username', getOneUser);
router.post('/followUser', authenticateJWT, followUser)
router.post('/unfollowUser', authenticateJWT, unfollowUser)

export default router;
