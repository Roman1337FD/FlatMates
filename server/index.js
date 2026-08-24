import 'dotenv/config';

import express from 'express';
import cors from 'cors';

import connectDB from './config/db.js';
import matchRoutes from './routes/matchRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/match', matchRoutes);
app.use('/api/chat', chatRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running smoothly!'
  });
});

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});