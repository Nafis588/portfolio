import mongoose, { Schema, Document } from 'mongoose';

export interface IExperience extends Document {
  roleTitle: string;
  organization: string;
  categoryType: 'Work' | 'Education' | 'Instruction' | 'Leadership' | 'Certification' | 'Achievement';
  periodStart: Date;
  periodEnd: Date | null;
  isActive: boolean;
  bulletPoints: string[];
  sortOrder: number;
  badge?: string;
  badgeBgColor?: string;
  badgeTextColor?: string;
  badgeShape?: 'pill' | 'circle' | 'square' | 'outline';
  link?: string;
}

const ExperienceSchema: Schema = new Schema(
  {
    roleTitle: { type: String, required: true },
    organization: { type: String, required: true },
    categoryType: {
      type: String,
      required: true,
      enum: ['Work', 'Education', 'Instruction', 'Leadership', 'Certification', 'Achievement']
    },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, default: null },
    isActive: { type: Boolean, default: false },
    bulletPoints: { type: [String], default: [] },
    sortOrder: { type: Number, default: 0 },
    badge: { type: String, default: '' },
    badgeBgColor: { type: String, default: '' },
    badgeTextColor: { type: String, default: '' },
    badgeShape: { type: String, default: 'pill' },
    link: { type: String, default: '' }
  },
  {
    timestamps: true
  }
);

const Experience = mongoose.model<IExperience>('Experience', ExperienceSchema);
export default Experience;
