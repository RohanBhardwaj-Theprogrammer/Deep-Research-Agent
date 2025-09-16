import mongoose, { Schema, Document, Types } from 'mongoose';
import { Source } from '../types';

export interface IResearchResult extends Document {
  _id: Types.ObjectId;
  queryId: string;
  content: string;
  sources: Source[];
  confidence: number;
  createdAt: Date;
}

const SourceSchema = new Schema({
  url: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  excerpt: {
    type: String,
    required: true,
  },
  relevance: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
  },
  type: {
    type: String,
    enum: ['web', 'academic', 'news', 'document'],
    required: true,
  },
});

const ResearchResultSchema = new Schema<IResearchResult>({
  queryId: {
    type: String,
    required: true,
    ref: 'ResearchQuery',
  },
  content: {
    type: String,
    required: true,
  },
  sources: [SourceSchema],
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
  },
}, {
  timestamps: true,
});

ResearchResultSchema.index({ queryId: 1 });
ResearchResultSchema.index({ confidence: -1 });
ResearchResultSchema.index({ createdAt: -1 });

export const ResearchResultModel = mongoose.model<IResearchResult>('ResearchResult', ResearchResultSchema);