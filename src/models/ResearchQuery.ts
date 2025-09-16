import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IResearchQuery extends Document {
  _id: Types.ObjectId;
  topic: string;
  depth: number;
  keywords: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const ResearchQuerySchema = new Schema<IResearchQuery>({
  topic: {
    type: String,
    required: true,
    trim: true,
  },
  depth: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  keywords: [{
    type: String,
    trim: true,
  }],
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'failed'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

ResearchQuerySchema.index({ topic: 'text', keywords: 'text' });
ResearchQuerySchema.index({ status: 1 });
ResearchQuerySchema.index({ createdAt: -1 });

export const ResearchQueryModel = mongoose.model<IResearchQuery>('ResearchQuery', ResearchQuerySchema);