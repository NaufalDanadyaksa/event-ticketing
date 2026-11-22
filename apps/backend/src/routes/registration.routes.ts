import { Router } from 'express';
import { RegistrationController } from '../controllers/RegistrationController';
import { authMiddleware, optionalAuthMiddleware, uploadReceipt } from '../middlewares';

const router = Router();

router.post(
  '/events/:id/register',
  optionalAuthMiddleware,
  uploadReceipt,
  RegistrationController.registerForEvent
);
router.get('/tickets/view/:magicToken', RegistrationController.getTicketByMagicToken);
router.get('/users/me/tickets', authMiddleware, RegistrationController.getMyTickets);

export default router;
export { router as registrationRoutes };
