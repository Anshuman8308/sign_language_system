import mongoose from 'mongoose';
import crypto from 'crypto';

const idempotencySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    key: {
      type: String,
      required: true,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
    },
    requestHash: {
      type: String,
      required: true,
    },
    responseSnapshot: {
      statusCode: Number,
      body: mongoose.Schema.Types.Mixed,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400, // TTL: 24 hours
    },
  },
  { timestamps: true }
);

idempotencySchema.index({ userId: 1, key: 1 }, { unique: true });

idempotencySchema.statics.generateHash = function (requestBody) {
  return crypto.createHash('sha256').update(JSON.stringify(requestBody)).digest('hex');
};

export default mongoose.model('IdempotencyRequest', idempotencySchema);
