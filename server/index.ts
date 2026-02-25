// projects/2048-game/server/index.ts
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Get top 10 scores
app.get('/api/leaderboard', async (req, res) => {
  const { mode = 'normal' } = req.query;
  try {
    const scores = await prisma.score.findMany({
      where: {
        mode: String(mode),
      },
      take: 10,
      orderBy: {
        score: 'desc',
      },
      include: {
        user: {
          select: { name: true },
        },
      },
    });
    res.json(scores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Submit a score
app.post('/api/score', async (req, res) => {
  const { name, score, mode = 'normal' } = req.body;

  if (!name || !score) {
    return res.status(400).json({ error: 'Name and score are required' });
  }

  try {
    let user = await prisma.user.findUnique({
      where: { name },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { name },
      });
    }

    const newScore = await prisma.score.create({
      data: {
        score: Number(score),
        mode: String(mode),
        userId: user.id,
      },
    });

    res.json(newScore);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit score' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
