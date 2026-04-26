const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const invitationSchema = new mongoose.Schema({
  token: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'La invitación debe ser para un proyecto']
  },
  inviter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'La invitación debe tener quien invita']
  },
  invitee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  email: {
    type: String,
    required: [true, 'El correo del invitado es obligatorio'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingrese un correo válido']
  },
  role: {
    type: String,
    enum: ['admin', 'member', 'developer', 'tester'],
    default: 'member'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'expired'],
    default: 'pending'
  },
  message: {
    type: String,
    trim: true,
    maxlength: [500, 'El mensaje no puede exceder 500 caracteres']
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
    required: true
  },
  respondedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
invitationSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

invitationSchema.virtual('daysUntilExpiry').get(function() {
  const now = new Date();
  const diffTime = this.expiresAt - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Métodos
invitationSchema.methods.accept = function(userId) {
  this.status = 'accepted';
  this.respondedAt = new Date();
  this.invitee = userId;
};

invitationSchema.methods.decline = function() {
  this.status = 'declined';
  this.respondedAt = new Date();
};

invitationSchema.methods.expire = function() {
  this.status = 'expired';
};

// Índices
invitationSchema.index({ token: 1 }, { unique: true });
invitationSchema.index({ project: 1, status: 1 });
invitationSchema.index({ email: 1, status: 1 });
invitationSchema.index({ invitee: 1, status: 1 });
invitationSchema.index({ expiresAt: 1 });

// Middleware para verificar expiración
invitationSchema.pre(/^find/, function(next) {
  this.where({
    $or: [
      { expiresAt: { $gt: new Date() } },
      { status: { $in: ['accepted', 'declined'] } }
    ]
  });
  next();
});

module.exports = mongoose.model('Invitation', invitationSchema);
