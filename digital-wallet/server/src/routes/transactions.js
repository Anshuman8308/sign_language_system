import express from 'express';
import {
  getTransactions,
  getTransaction,
  exportCSV,
} from '../controllers/transactionController.js';
import { authenticate } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(authenticate);

router.get('/', apiLimiter, getTransactions);
router.get('/export/csv', apiLimiter, exportCSV);
router.get('/:id', getTransaction);

export default router;
