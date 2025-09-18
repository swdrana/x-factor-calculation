import mongoose, { Schema, Document } from 'mongoose';

export interface ICurrencyRate extends Document {
  currency: 'USD' | 'RMB';
  rateToBDT: number;
  updatedAt: Date;
  createdAt: Date;
}

const CurrencyRateSchema: Schema = new Schema({
  currency: {
    type: String,
    enum: ['USD', 'RMB'],
    required: true,
    unique: true,
  },
  rateToBDT: {
    type: Number,
    required: true,
    min: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.models.CurrencyRate || mongoose.model<ICurrencyRate>('CurrencyRate', CurrencyRateSchema);