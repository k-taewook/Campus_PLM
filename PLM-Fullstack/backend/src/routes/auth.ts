import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@plm.com
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', (req, res) => {
  // Mock implementation - replace with real authentication
  const { email, password } = req.body;
  
  if (email === 'admin@plm.com' && password === 'admin123') {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email: 'admin@plm.com',
          name: 'PLM Admin',
          role: 'admin'
        }
      }
    });
  } else if (email === 'user@plm.com' && password === 'user123') {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token: 'mock-jwt-token',
        user: {
          id: '2',
          email: 'user@plm.com',
          name: 'PLM User',
          role: 'user'
        }
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: User registration
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registration successful
 *       400:
 *         description: Invalid input
 */
router.post('/register', (req, res) => {
  // Mock implementation
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: {
        id: Date.now().toString(),
        ...req.body,
        role: 'user'
      }
    }
  });
});

export default router;