import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        email: 'admin@plm.com',
        name: 'PLM Admin',
        role: 'admin',
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '2', 
        email: 'user@plm.com',
        name: 'PLM User',
        role: 'user',
        createdAt: '2024-01-02T00:00:00Z'
      }
    ]
  });
});

export default router;