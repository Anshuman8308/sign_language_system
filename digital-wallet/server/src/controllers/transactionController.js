import Transaction from '../models/Transaction.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createObjectCsvStringifier } from 'csv-writer';

// @route GET /api/transactions
export const getTransactions = asyncHandler(async (req, res) => {
  const { type, status, min, max, from, to, q, page = 1, limit = 10 } = req.query;
  const userId = req.user._id;
  const query = { userId };

  if (type && ['DEPOSIT', 'WITHDRAW', 'TRANSFER_SENT', 'TRANSFER_RECEIVED'].includes(type.toUpperCase())) {
    query.type = type.toUpperCase();
  }
  if (status && ['PENDING', 'SUCCESS', 'FAILED', 'REVERSED'].includes(status.toUpperCase())) {
    query.status = status.toUpperCase();
  }
  if (min || max) {
    query.amountPaise = {};
    if (min && !isNaN(min)) query.amountPaise.$gte = Math.round(parseFloat(min) * 100);
    if (max && !isNaN(max)) query.amountPaise.$lte = Math.round(parseFloat(max) * 100);
  }
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }
  if (q && q.trim()) {
    query.$text = { $search: q.trim() };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('fromUserId', 'name email')
      .populate('toUserId', 'name email')
      .lean(),
    Transaction.countDocuments(query),
  ]);

  const formatted = transactions.map((txn) => ({
    ...txn,
    amount: (txn.amountPaise / 100).toFixed(2),
    amountPaise: undefined,
  }));

  res.json({
    success: true,
    data: {
      transactions: formatted,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

// @route GET /api/transactions/:id
export const getTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    userId: req.user._id,
  })
    .populate('fromUserId', 'name email')
    .populate('toUserId', 'name email');

  if (!transaction) {
    return res.status(404).json({ success: false, message: 'Transaction not found' });
  }

  res.json({ success: true, data: transaction });
});

// @route GET /api/transactions/export/csv
export const exportCSV = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const userId = req.user._id;

  const query = { userId, status: 'SUCCESS' };
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }

  const transactions = await Transaction.find(query)
    .sort({ createdAt: -1 })
    .populate('fromUserId', 'name email')
    .populate('toUserId', 'name email')
    .lean();

  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: 'createdAt', title: 'Date' },
      { id: 'reference', title: 'Reference ID' },
      { id: 'type', title: 'Type' },
      { id: 'amount', title: 'Amount (INR)' },
      { id: 'status', title: 'Status' },
      { id: 'counterparty', title: 'Counterparty' },
      { id: 'description', title: 'Description' },
    ],
  });

  const records = transactions.map((txn) => {
    let counterparty = '';
    if (txn.type === 'TRANSFER_SENT' && txn.toUserId) counterparty = `${txn.toUserId.name} (${txn.toUserId.email})`;
    if (txn.type === 'TRANSFER_RECEIVED' && txn.fromUserId) counterparty = `${txn.fromUserId.name} (${txn.fromUserId.email})`;

    return {
      createdAt: new Date(txn.createdAt).toISOString(),
      reference: txn.reference || '',
      type: txn.type,
      amount: (txn.amountPaise / 100).toFixed(2),
      status: txn.status,
      counterparty,
      description: txn.description || '',
    };
  });

  const csvContent = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="transactions_${Date.now()}.csv"`);
  res.send(csvContent);
});
