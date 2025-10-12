import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalProjects: 5,
      activeProjects: 3,
      totalTasks: 25,
      completedTasks: 15,
      totalUsers: 8,
      activeUsers: 6
    }
  });
});

export default router;