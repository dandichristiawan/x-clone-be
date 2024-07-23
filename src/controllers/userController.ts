import { Request, Response } from 'express';
import { db } from '../mongodb/mongodb';

export async function getAllUsers(req: Request, res: Response): Promise<void> {
  try {
    const userCollection = db.collection('users');
    const users = await userCollection.find().toArray();
    res.status(200).json(users);
  } catch (error) {
    console.error('Failed to fetch users', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
}
