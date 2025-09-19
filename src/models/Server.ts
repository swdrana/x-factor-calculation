import mongoose, { Document, Schema } from 'mongoose';

export interface IServer extends Document {
  name: string;
  websiteLink?: string; // Optional website link
  originalPrice: number;
  originalCurrency: 'USD' | 'RMB' | 'BDT';
  duration: number; // in months
  bandwidth: number; // in TB
  priceInBDT: number;
  monthlyCostBDT: number;
  costPerTB: number;
  costPerGB: number;
  xFactor: number;
  isBaseServer: boolean; // New field to mark base server
  createdAt: Date;
  updatedAt: Date;
}

const ServerSchema = new Schema<IServer>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  websiteLink: {
    type: String,
    required: false,
    trim: true,
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  originalCurrency: {
    type: String,
    enum: ['USD', 'RMB', 'BDT'],
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
  },
  bandwidth: {
    type: Number,
    required: true,
    min: 0.1,
  },
  priceInBDT: {
    type: Number,
    required: true,
  },
  monthlyCostBDT: {
    type: Number,
    required: true,
  },
  costPerTB: {
    type: Number,
    required: true,
  },
  costPerGB: {
    type: Number,
    required: true,
  },
  xFactor: {
    type: Number,
    required: true,
  },
  isBaseServer: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Ensure only one base server exists
ServerSchema.pre('save', async function(next) {
  if (this.isBaseServer) {
    // Remove base server flag from all other servers
    await mongoose.model('Server').updateMany(
      { _id: { $ne: this._id } },
      { $set: { isBaseServer: false } }
    );
  }
  next();
});

export default mongoose.models.Server || mongoose.model<IServer>('Server', ServerSchema);