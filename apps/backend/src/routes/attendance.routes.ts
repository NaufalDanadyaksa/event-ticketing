import { Router } from 'express';
import { Role } from 'shared';
import { AttendanceController } from '../controllers/AttendanceController';
import { authMiddleware, optionalAuthMiddleware, roleGuard } from '../middlewares';

const router = Router();

router.get(
  '/events/:id/live-attendance-token',
  authMiddleware,
  roleGuard(Role.ADMIN),
  AttendanceController.getLiveToken
);
router.post('/verify', optionalAuthMiddleware, AttendanceController.verifyAttendance);

export default router;
export { router as attendanceRoutes };
