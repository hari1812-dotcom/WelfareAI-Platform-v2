import { Router } from 'express';
import { getPublicFeedback, submitFeedback } from '../controllers/feedbackController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getPublicFeedback);
router.post('/', authenticate, submitFeedback);

export default router;
