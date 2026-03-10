import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    // Store as integer paise to avoid float precision errors
    balancePaise: {
      type: Number,
      default: 0,
      min: [0, 'Balance cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    versionKey: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.balance = ret.balancePaise / 100;
        delete ret.balancePaise;
        delete ret.__v;
        delete ret.versionKey;
        return ret;
      },
    },
  }
);

walletSchema.index({ userId: 1, isActive: 1 });

export default mongoose.model('Wallet', walletSchema);
