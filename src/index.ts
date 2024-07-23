import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import { client, connectToMongoDB } from './mongodb/mongodb';
import userRoutes from './routes/userRoutes';
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/api', userRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, async () => {
  await connectToMongoDB();
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
