import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { eventRoutes } from './event.routes';
import { adminRoutes } from './admin.routes';
import { staffRoutes } from './staff.routes';
import { attendanceRoutes } from './attendance.routes';
import { registrationRoutes } from './registration.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/admin', adminRoutes);
router.use('/staff', staffRoutes);
router.use('/attendance', attendanceRoutes);

// Mounting registrationRoutes directly under /api allows:
// POST /api/events/:id/register
// GET  /api/tickets/view/:magicToken
// GET  /api/users/me/tickets
router.use(registrationRoutes);

export default router;
export {
  router as apiRouter,
  authRoutes,
  eventRoutes,
  adminRoutes,
  staffRoutes,
  attendanceRoutes,
  registrationRoutes,
};
