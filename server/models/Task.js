import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Task must belong to a project'],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['To Do', 'In Progress', 'Done'],
      default: 'To Do',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    dueDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Populate references
taskSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'assignedTo',
    select: 'name email avatar',
  })
    .populate({
      path: 'createdBy',
      select: 'name email avatar',
    })
    .populate({
      path: 'projectId',
      select: 'name',
    });
  next();
});

// Add virtual for isOverdue
taskSchema.virtual('isOverdue').get(function () {
  return this.status !== 'Done' && new Date() > this.dueDate;
});

export default mongoose.model('Task', taskSchema);
