import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

const appRouter = t.router({
  getLeaderboard: t.procedure
    .input(z.object({ mode: z.string().default('easy') }))
    .query(async ({ input }) => {
      // This will be implemented with actual database call
      // For now, return mock data
      return [
        { id: 1, score: 10000, mode: input.mode, user: { name: 'Player 1' }, created_at: new Date().toISOString() },
        { id: 2, score: 8000, mode: input.mode, user: { name: 'Player 2' }, created_at: new Date().toISOString() },
      ];
    }),
    
  submitScore: t.procedure
    .input(z.object({
      name: z.string(),
      score: z.number(),
      mode: z.string(),
      deviceId: z.string(),
    }))
    .mutation(async ({ input }) => {
      // This will be implemented with actual database call
      console.log('Submitting score:', input);
      return { success: true, id: Date.now() };
    }),
});

export type AppRouter = typeof appRouter;
export { appRouter };
