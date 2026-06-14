import mongoose, { Schema, Document } from 'mongoose';

export interface IStartup extends Document {
  brandName: string;
  role: string;
  philosophy: string;
  websiteUrl?: string;
  logoUrl?: string;
  isActive: boolean;
}

const StartupSchema: Schema = new Schema(
  {
    brandName: { type: String, required: true },
    role: { type: String, required: true },
    philosophy: { type: String, required: true },
    websiteUrl: { type: String },
    logoUrl: { type: String },
    isActive: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

const Startup = mongoose.model<IStartup>('Startup', StartupSchema);
export default Startup;
