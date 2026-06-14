import mongoose, { Schema, Document } from 'mongoose';

export interface ISkill extends Document {
  name: string;
  category: string;
  icon?: string;
  sortOrder: number;
}

const SkillSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    icon: { type: String, default: '🛠️' },
    sortOrder: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

const Skill = mongoose.model<ISkill>('Skill', SkillSchema);
export default Skill;
