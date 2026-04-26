const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del proyecto es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  key: {
    type: String,
    required: [true, 'La clave del proyecto es obligatoria'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [2, 'La clave debe tener al menos 2 caracteres'],
    maxlength: [10, 'La clave no puede exceder 10 caracteres'],
    match: [/^[A-Z][A-Z0-9]*$/, 'La clave debe empezar con letra y contener solo letras mayúsculas y números']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El proyecto debe tener un propietario']
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member', 'developer', 'tester'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  },
  type: {
    type: String,
    enum: ['scrum', 'kanban', 'waterfall'],
    default: 'scrum'
  },
  avatar: {
    type: String,
    default: null
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  settings: {
    allowInvitations: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    defaultAssignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  statistics: {
    totalTasks: {
      type: Number,
      default: 0
    },
    completedTasks: {
      type: Number,
      default: 0
    },
    activeSprints: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
projectSchema.virtual('isOwner').get(function() {
  return this.owner && this.owner.toString();
});

projectSchema.virtual('memberCount').get(function() {
  return this.members ? this.members.length : 0;
});

// Métodos
projectSchema.methods.isMember = function(userId) {
  if (!this.members) return false;
  const targetId = userId._id ? userId._id.toString() : userId.toString();
  return this.members.some(member => {
    const memberId = member.user._id ? member.user._id.toString() : member.user.toString();
    return memberId === targetId;
  });
};

projectSchema.methods.getMemberRole = function(userId) {
  if (!this.members) return null;
  const targetId = userId._id ? userId._id.toString() : userId.toString();
  const member = this.members.find(member => {
    const memberId = member.user._id ? member.user._id.toString() : member.user.toString();
    return memberId === targetId;
  });
  return member ? member.role : null;
};

projectSchema.methods.isAdmin = function(userId) {
  const role = this.getMemberRole(userId);
  const targetId = userId._id ? userId._id.toString() : userId.toString();
  const ownerId = this.owner._id ? this.owner._id.toString() : this.owner.toString();
  return role === 'admin' || ownerId === targetId;
};

projectSchema.methods.addMember = function(userId, role = 'member') {
  if (!this.isMember(userId)) {
    this.members.push({
      user: userId,
      role: role,
      joinedAt: new Date()
    });
  }
};

projectSchema.methods.removeMember = function(userId) {
  if (this.members) {
    const targetId = userId._id ? userId._id.toString() : userId.toString();
    this.members = this.members.filter(member => {
      const memberId = member.user._id ? member.user._id.toString() : member.user.toString();
      return memberId !== targetId;
    });
  }
};

// Índices
projectSchema.index({ owner: 1 });
projectSchema.index({ key: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ 'members.user': 1 });

module.exports = mongoose.model('Project', projectSchema);
