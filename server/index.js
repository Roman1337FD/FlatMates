import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import matchRoutes from './routes/matchRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/match', matchRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running smoothly!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});