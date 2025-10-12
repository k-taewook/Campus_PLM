import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of projects
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        name: 'PLM 시스템 구축',
        description: '제품 생명주기 관리 시스템 개발',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z'
      }
    ]
  });
});

export default router;