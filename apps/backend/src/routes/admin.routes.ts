import { Router } from 'express';
import { Role } from 'shared';
import { AdminEventController } from '../controllers/AdminEventController';
import { AdminRegistrationController } from '../controllers/AdminRegistrationController';
import { authMiddleware, roleGuard, uploadBanner } from '../middlewares';

const router = Router();

// Protect all admin routes with authMiddleware and roleGuard(Role.ADMIN)
router.use(authMiddleware, roleGuard(Role.ADMIN));

// Event management
router.get('/events', AdminEventController.listAllEvents);
router.post('/events', uploadBanner, AdminEventController.createEvent);
router.put('/events/:id', uploadBanner, AdminEventController.updateEvent);
router.patch('/events/:id/publish', AdminEventController.togglePublish);

// Registration & payment review
router.get('/registrations', AdminRegistrationController.listRegistrations);
router.get('/registrations/:id', AdminRegistrationController.getRegistrationDetail);
router.patch('/registrations/:id/review', AdminRegistrationController.reviewPayment);

export default router;
export { router as adminRoutes };
