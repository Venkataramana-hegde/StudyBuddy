import {Router} from 'express';
import { createGroup } from './groups.controller.js';
import authenticate from '../../middlewares/authMiddleware.js';

const router = Router();

router.post("/group",authenticate, createGroup);

export default router;