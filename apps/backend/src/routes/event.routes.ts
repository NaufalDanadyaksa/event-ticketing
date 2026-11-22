import { Router } from 'express';
import { EventController } from '../controllers/EventController';

const router = Router();

router.get('/', EventController.listEvents);
router.get('/:slug', EventController.getEventDetail);

export default router;
export { router as eventRoutes };
