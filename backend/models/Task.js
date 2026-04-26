const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título de la tarea es obligatorio'],
    trim: true,
    maxlength: [200, 'El título no puede exceder 200 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'La descripción no puede exceder 2000 caracteres']
  },
  key: {
    type: String,
    required: true,
    trim: true
  },
  number: {
    type: Number,
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'La tarea debe pertenecer a un proyecto']
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'La tarea debe tener un reportero']
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['story', 'task', 'bug', 'epic', 'subtask'],
    default: 'task'
  },
  priority: {
    type: String,
    enum: ['lowest', 'low', 'medium', 'high', 'highest'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'in-review', 'done', 'blocked'],
    default: 'todo'
  },
  labels: [{
    type: String,
    trim: true,
    maxlength: [20, 'Las etiquetas no pueden exceder 20 caracteres']
  }],
  storyPoints: {
    type: Number,
    min: 1,
    max: 21,
    default: null
  },
  originalEstimate: {
    type: Number, // en horas
    min: 0
  },
  remainingEstimate: {
    type: Number, // en horas
    min: 0
  },
  timeSpent: {
    type: Number, // en horas
    default: 0,
    min: 0
  },
  sprint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sprint'
  },
  epic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  subtasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Los comentarios no pueden exceder 1000 caracteres']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  watchers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dueDate: {
    type: Date
  },
  resolution: {
    type: String,
    enum: ['done', 'wont-fix', 'duplicate', 'cannot-reproduce', 'fixed']
  },
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const mongoosePaginate = require('mongoose-paginate-v2');
taskSchema.plugin(mongoosePaginate);

// Virtuals
taskSchema.virtual('fullKey').get(function() {
  return `${this.key}-${this.number}`;
});

taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate) return false;
  return this.dueDate < new Date() && this.status !== 'done';
});

taskSchema.virtual('completionPercentage').get(function() {
  if (this.status === 'done') return 100;
  if (this.originalEstimate === 0) return 0;
  return Math.round((this.timeSpent / this.originalEstimate) * 100);
});

// Métodos
taskSchema.methods.addComment = function(authorId, content) {
  this.comments.push({
    author: authorId,
    content: content
  });
};

taskSchema.methods.addWatcher = function(userId) {
  if (!this.watchers.includes(userId)) {
    this.watchers.push(userId);
  }
};

taskSchema.methods.removeWatcher = function(userId) {
  this.watchers = this.watchers.filter(watcher => 
    watcher.toString() !== userId.toString()
  );
};

taskSchema.methods.logTime = function(hoursSpent) {
  this.timeSpent += hoursSpent;
  if (this.remainingEstimate !== null) {
    this.remainingEstimate = Math.max(0, this.remainingEstimate - hoursSpent);
  }
};

taskSchema.methods.resolve = function(resolution, resolvedBy) {
  this.status = 'done';
  this.resolution = resolution;
  this.resolvedAt = new Date();
  this.resolvedBy = resolvedBy;
};

// Índices
taskSchema.index({ project: 1, number: 1 }, { unique: true });
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ reporter: 1 });
taskSchema.index({ sprint: 1 });
taskSchema.index({ epic: 1 });
taskSchema.index({ parent: 1 });

// Middleware para generar número de tarea automáticamente
taskSchema.pre('save', async function(next) {
  if (this.isNew && !this.number) {
    try {
      const Project = mongoose.model('Project');
      const project = await Project.findById(this.project);
      if (project) {
        const lastTask = await this.constructor
          .findOne({ project: this.project })
          .sort('-number');
        this.number = lastTask ? lastTask.number + 1 : 1;
        this.key = project.key;
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);
