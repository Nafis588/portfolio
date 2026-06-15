import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  client: string;
  category: 'Enterprise' | 'Academic' | 'Startup';
  status: 'Delivered' | 'In Progress' | 'Planned';
  sdlcStage?: 'Planning' | 'Analysis' | 'Design' | 'Implementation' | 'Testing' | 'Deployment' | 'Maintenance';
  description: string;
  technologies: string[];
  repositoryUrl?: string;
  liveUrl?: string;
  thumbnailUrl?: string;
  sortOrder: number;
}

const ProjectSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    client: { type: String, required: true, default: '' },
    category: {
      type: String,
      required: true,
      enum: ['Enterprise', 'Academic', 'Startup']
    },
    status: {
      type: String,
      required: true,
      enum: ['Delivered', 'In Progress', 'Planned'],
      default: 'Delivered'
    },
    sdlcStage: {
      type: String,
      required: true,
      enum: ['Planning', 'Analysis', 'Design', 'Implementation', 'Testing', 'Deployment', 'Maintenance'],
      default: 'Planning'
    },
    description: { type: String, required: true },
    technologies: { type: [String], default: [] },
    repositoryUrl: { type: String },
    liveUrl: { type: String },
    thumbnailUrl: { type: String },
    sortOrder: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

const Project = mongoose.model<IProject>('Project', ProjectSchema);
export default Project;
