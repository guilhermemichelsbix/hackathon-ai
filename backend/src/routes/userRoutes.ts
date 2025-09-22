import { Router } from 'express';
import { UserController } from '@/controllers/userController';

const router = Router();
const userController = new UserController();

// GET /users?search=...&limit=50&offset=0
router.get('/', userController.getUsers);

export default router;


