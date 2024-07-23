import express from 'express';
import { getAllUsers, signUpUser, Login } from '../controllers/userController';

const router = express.Router();

router.get('/users', getAllUsers);
router.post('/signup', signUpUser);
router.post('/login', Login);

export default router;
