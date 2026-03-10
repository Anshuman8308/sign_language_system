/**
 * Migration script: Convert existing float balance/amount to integer paise.
 * Only needed if you had an older version of this project.
 * Run: npm run migrate
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    const db = mongoose.connection.db;

    const wallets = await db.collection('wallets').find({ balance: { $exists: true } }).toArray();
    console.log(`Found ${wallets.length} wallets to migrate`);

    for (const wallet of wallets) {
      const newBalancePaise = Math.round((wallet.balance || 0) * 100);
      await db.collection('wallets').updateOne(
        { _id: wallet._id },
        { $set: { balancePaise: newBalancePaise }, $unset: { balance: '' } }
      );
      console.log(`✓ Wallet ${wallet._id}: ₹${wallet.balance} → ${newBalancePaise} paise`);
    }

    const transactions = await db.collection('transactions').find({ amount: { $exists: true } }).toArray();
    console.log(`Found ${transactions.length} transactions to migrate`);

    for (const txn of transactions) {
      const newAmountPaise = Math.round((txn.amount || 0) * 100);
      await db.collection('transactions').updateOne(
        { _id: txn._id },
        { $set: { amountPaise: newAmountPaise }, $unset: { amount: '' } }
      );
    }

    console.log('✅ Migration complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrate();
