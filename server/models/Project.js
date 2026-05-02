import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a project name'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['Admin', 'Member'],
          default: 'Member',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Ensure creator is always in members as Admin
projectSchema.pre('save', async function (next) {
  if (this.isNew) {
    const creatorExists = this.members.some((m) => m.userId.toString() === this.createdBy.toString());
    if (!creatorExists) {
      this.members.push({
        userId: this.createdBy,
        role: 'Admin',
        joinedAt: new Date(),
      });
    }
  }
  next();
});

// Populate members when fetching
projectSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next();
  }
  this.populate({
    path: 'members.userId',
    select: 'name email avatar',
  }).populate({
    path: 'createdBy',
    select: 'name email avatar',
  });
  next();
});

export default mongoose.model('Project', projectSchema);
