import { Router } from 'express';
import { Role } from 'shared';
import { StaffController } from '../controllers/StaffController';
import { authMiddleware, roleGuard } from '../middlewares';

const router = Router();

router.post(
  '/check-in',
  authMiddleware,
  roleGuard(Role.STAFF, Role.ADMIN),
  StaffController.checkIn
);

export default router;
export { router as staffRoutes };
