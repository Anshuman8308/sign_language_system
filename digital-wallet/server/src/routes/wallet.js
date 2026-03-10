import express from 'express';
import { getBalance, deposit, withdraw, transfer } from '../controllers/walletController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { depositSchema, withdrawSchema, transferSchema } from '../validations/schemas.js';
import { financialLimiter } from '../middleware/rateLimiter.js';
import { idempotencyMiddleware } from '../middleware/idempotency.js';

const router = express.Router();

router.use(authenticate);

router.get('/balance', getBalance);
router.post('/deposit', financialLimiter, idempotencyMiddleware, validate(depositSchema), deposit);
router.post('/withdraw', financialLimiter, idempotencyMiddleware, validate(withdrawSchema), withdraw);
router.post('/transfer', financialLimiter, idempotencyMiddleware, validate(transferSchema), transfer);

export default router;
