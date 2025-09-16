import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IResearchAgent extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  modelName: string;
  systemPrompt: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ResearchAgentSchema = new Schema<IResearchAgent>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  modelName: {
    type: String,
    required: true,
    trim: true,
  },
  systemPrompt: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

ResearchAgentSchema.index({ name: 1 });
ResearchAgentSchema.index({ isActive: 1 });

export const ResearchAgentModel = mongoose.model<IResearchAgent>('ResearchAgent', ResearchAgentSchema);