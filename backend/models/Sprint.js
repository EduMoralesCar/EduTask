const mongoose = require('mongoose');

const sprintSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del sprint es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'El sprint debe pertenecer a un proyecto']
  },
  state: {
    type: String,
    enum: ['planning', 'active', 'completed', 'closed'],
    default: 'planning'
  },
  startDate: {
    type: Date,
    required: [true, 'La fecha de inicio es obligatoria']
  },
  endDate: {
    type: Date,
    required: [true, 'La fecha de fin es obligatoria']
  },
  completedDate: {
    type: Date
  },
  goal: {
    type: String,
    trim: true,
    maxlength: [500, 'El objetivo no puede exceder 500 caracteres']
  },
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  capacity: {
    type: Number, // en story points
    default: 0
  },
  velocity: {
    type: Number, // story points completados
    default: 0
  },
  burndown: [{
    date: {
      type: Date,
      required: true
    },
    remaining: {
      type: Number,
      required: true
    },
    completed: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
sprintSchema.virtual('duration').get(function() {
  return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
});

sprintSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.state === 'active' && this.startDate <= now && this.endDate >= now;
});

sprintSchema.virtual('isOverdue').get(function() {
  return this.state === 'active' && this.endDate < new Date();
});

sprintSchema.virtual('completionPercentage').get(function() {
  if (this.capacity === 0) return 0;
  return Math.round((this.velocity / this.capacity) * 100);
});

// Métodos
sprintSchema.methods.addTask = function(taskId) {
  if (!this.tasks.includes(taskId)) {
    this.tasks.push(taskId);
  }
};

sprintSchema.methods.removeTask = function(taskId) {
  this.tasks = this.tasks.filter(task => 
    task.toString() !== taskId.toString()
  );
};

sprintSchema.methods.start = function() {
  this.state = 'active';
  this.startDate = new Date();
  // Inicializar burndown
  this.burndown = [{
    date: this.startDate,
    remaining: this.capacity,
    completed: 0
  }];
};

sprintSchema.methods.complete = function() {
  this.state = 'completed';
  this.completedDate = new Date();
  // Calcular velocity final
  this.calculateVelocity();
};

sprintSchema.methods.calculateVelocity = function() {
  const Task = mongoose.model('Task');
  Task.countDocuments({ 
    sprint: this._id, 
    status: 'done' 
  })
  .then(completedTasks => {
    Task.find({ 
      sprint: this._id, 
      status: 'done' 
    })
    .then(tasks => {
      this.velocity = tasks.reduce((total, task) => 
        total + (task.storyPoints || 0), 0
      );
      return this.save();
    });
  });
};

sprintSchema.methods.updateBurndown = function() {
  const Task = mongoose.model('Task');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  Task.find({ sprint: this._id })
    .then(tasks => {
      const remaining = tasks.reduce((total, task) => {
        if (task.status === 'done') return total;
        return total + (task.storyPoints || 1);
      }, 0);
      
      const completed = tasks.reduce((total, task) => {
        if (task.status === 'done') return total + (task.storyPoints || 1);
        return total;
      }, 0);
      
      // Actualizar o añadir entrada de burndown para hoy
      const existingEntry = this.burndown.find(entry => 
        entry.date.toDateString() === today.toDateString()
      );
      
      if (existingEntry) {
        existingEntry.remaining = remaining;
        existingEntry.completed = completed;
      } else {
        this.burndown.push({
          date: today,
          remaining: remaining,
          completed: completed
        });
      }
      
      return this.save();
    });
};

// Índices
sprintSchema.index({ project: 1, state: 1 });
sprintSchema.index({ project: 1, startDate: 1 });
sprintSchema.index({ project: 1, endDate: 1 });

module.exports = mongoose.model('Sprint', sprintSchema);
