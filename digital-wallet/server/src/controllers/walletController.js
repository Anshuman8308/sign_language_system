import mongoose from 'mongoose';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { toPaise, toRupees } from '../utils/money.js';

const updateTxnStatus = async (session, id, status, extra = {}) => {
  await Transaction.findByIdAndUpdate(
    id,
    { status, completedAt: status === 'SUCCESS' ? new Date() : null, ...extra },
    { session }
  );
};

// @route GET /api/wallet/balance
export const getBalance = asyncHandler(async (req, res) => {
  const wallet = await Wallet.findOne({ userId: req.user._id });
  if (!wallet) return res.status(404).json({ success: false, message: 'Wallet not found' });

  res.json({
    success: true,
    data: { balance: toRupees(wallet.balancePaise), currency: wallet.currency },
  });
});

// @route POST /api/wallet/deposit
export const deposit = asyncHandler(async (req, res) => {
  const { amount, description } = req.body;
  const userId = req.user._id;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid amount' });
  }

  const amountPaise = toPaise(amount);
  const session = await mongoose.startSession();
  session.startTransaction();
  let transaction;

  try {
    [transaction] = await Transaction.create(
      [{ userId, type: 'DEPOSIT', amountPaise, description: (description || 'Wallet deposit').substring(0, 200), status: 'PENDING', idempotencyKey: req.idempotencyContext?.key }],
      { session }
    );

    const wallet = await Wallet.findOneAndUpdate(
      { userId },
      { $inc: { balancePaise: amountPaise } },
      { new: true, session }
    );

    if (!wallet) throw new Error('Wallet not found');

    await updateTxnStatus(session, transaction._id, 'SUCCESS');
    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Deposit successful',
      data: { transactionId: transaction._id, reference: transaction.reference, newBalance: toRupees(wallet.balancePaise) },
    });
  } catch (error) {
    await session.abortTransaction();
    if (transaction?._id) await Transaction.findByIdAndUpdate(transaction._id, { status: 'FAILED', 'metadata.error': error.message });
    throw error;
  } finally {
    session.endSession();
  }
});

// @route POST /api/wallet/withdraw
export const withdraw = asyncHandler(async (req, res) => {
  const { amount, description } = req.body;
  const userId = req.user._id;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid amount' });
  }

  const amountPaise = toPaise(amount);
  const session = await mongoose.startSession();
  session.startTransaction();
  let transaction;

  try {
    [transaction] = await Transaction.create(
      [{ userId, type: 'WITHDRAW', amountPaise, description: (description || 'Wallet withdrawal').substring(0, 200), status: 'PENDING', idempotencyKey: req.idempotencyContext?.key }],
      { session }
    );

    const wallet = await Wallet.findOne({ userId }).session(session);
    if (!wallet) throw new Error('Wallet not found');

    if (wallet.balancePaise < amountPaise) {
      await updateTxnStatus(session, transaction._id, 'FAILED', { 'metadata.error': 'Insufficient balance' });
      await session.commitTransaction();
      return res.status(400).json({ success: false, message: 'Insufficient balance', data: { transactionId: transaction._id, status: 'FAILED' } });
    }

    wallet.balancePaise -= amountPaise;
    await wallet.save({ session });
    await updateTxnStatus(session, transaction._id, 'SUCCESS');
    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Withdrawal successful',
      data: { transactionId: transaction._id, reference: transaction.reference, newBalance: toRupees(wallet.balancePaise) },
    });
  } catch (error) {
    await session.abortTransaction();
    if (transaction?._id) await Transaction.findByIdAndUpdate(transaction._id, { status: 'FAILED', 'metadata.error': error.message });
    throw error;
  } finally {
    session.endSession();
  }
});

// @route POST /api/wallet/transfer
export const transfer = asyncHandler(async (req, res) => {
  const { receiverEmail, amount, description } = req.body;
  const senderId = req.user._id;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid amount' });
  }

  const normalizedEmail = receiverEmail.toLowerCase().trim();
  const sender = await User.findById(senderId);

  if (sender.email === normalizedEmail) {
    return res.status(400).json({ success: false, message: 'Cannot transfer to yourself' });
  }

  const amountPaise = toPaise(amount);
  const session = await mongoose.startSession();
  session.startTransaction();
  let senderTxn, receiverTxn;

  try {
    const receiver = await User.findOne({ email: normalizedEmail }).session(session);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Receiver not found' });
    }
    if (!receiver.isActive) {
      return res.status(400).json({ success: false, message: 'Receiver account is inactive' });
    }

    const senderWallet = await Wallet.findOne({ userId: senderId }).session(session);
    if (!senderWallet || senderWallet.balancePaise < amountPaise) {
      [senderTxn] = await Transaction.create(
        [{ userId: senderId, type: 'TRANSFER_SENT', amountPaise, toUserId: receiver._id, description: (description || `Transfer to ${receiver.name}`).substring(0, 200), status: 'FAILED', idempotencyKey: req.idempotencyContext?.key, metadata: { error: 'Insufficient balance' } }],
        { session }
      );
      await session.commitTransaction();
      return res.status(400).json({ success: false, message: 'Insufficient balance', data: { transactionId: senderTxn._id, status: 'FAILED' } });
    }

    let receiverWallet = await Wallet.findOne({ userId: receiver._id }).session(session);
    if (!receiverWallet) {
      [receiverWallet] = await Wallet.create([{ userId: receiver._id, balancePaise: 0, currency: 'INR' }], { session });
    }

    const now = new Date();
    [senderTxn] = await Transaction.create(
      [{ userId: senderId, type: 'TRANSFER_SENT', amountPaise, toUserId: receiver._id, description: (description || `Transfer to ${receiver.name}`).substring(0, 200), status: 'PENDING', idempotencyKey: req.idempotencyContext?.key, createdAt: now }],
      { session }
    );
    [receiverTxn] = await Transaction.create(
      [{ userId: receiver._id, type: 'TRANSFER_RECEIVED', amountPaise, fromUserId: senderId, description: (description || `Transfer from ${sender.name}`).substring(0, 200), status: 'PENDING', createdAt: now }],
      { session }
    );

    senderWallet.balancePaise -= amountPaise;
    senderWallet.versionKey += 1;
    await senderWallet.save({ session });

    receiverWallet.balancePaise += amountPaise;
    receiverWallet.versionKey += 1;
    await receiverWallet.save({ session });

    await updateTxnStatus(session, senderTxn._id, 'SUCCESS');
    await updateTxnStatus(session, receiverTxn._id, 'SUCCESS');
    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Transfer successful',
      data: {
        transactionId: senderTxn._id,
        reference: senderTxn.reference,
        newBalance: toRupees(senderWallet.balancePaise),
        receiver: { name: receiver.name, email: receiver.email },
      },
    });
  } catch (error) {
    await session.abortTransaction();
    if (senderTxn?._id) await Transaction.findByIdAndUpdate(senderTxn._id, { status: 'FAILED', 'metadata.error': error.message });
    if (receiverTxn?._id) await Transaction.findByIdAndUpdate(receiverTxn._id, { status: 'FAILED', 'metadata.error': error.message });
    throw error;
  } finally {
    session.endSession();
  }
});
