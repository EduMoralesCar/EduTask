const express = require('express');
const router = express.Router();
const Invitation = require('../models/Invitation');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

// Mis invitaciones pendientes
router.get('/me', protect, async (req, res) => {
  try {
    const invitations = await Invitation.find({ 
      email: req.user.email,
      status: 'pending' 
    })
    .populate('project', 'name key description')
    .populate('inviter', 'username firstName lastName fullName')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { invitations }
    });
  } catch (error) {
    console.error('Error al obtener mis invitaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al obtener mis invitaciones'
    });
  }
});

// Obtener detalles de una invitación
router.get('/:token', protect, async (req, res) => {
  try {
    const { token } = req.params;
    
    // El middleware pre('find') del schema filtra los expirados, así que si encontramos la invitación, no está expirada (o ya fue respondida).
    const invitation = await Invitation.findOne({ token })
      .populate('project', 'name key description')
      .populate('inviter', 'username firstName lastName fullName');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'La invitación no existe o ha expirado'
      });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Esta invitación ya fue ${invitation.status === 'accepted' ? 'aceptada' : 'rechazada'}`
      });
    }

    // Verificar si el email coincide (opcional, dependiendo de cuán estricto se quiera ser)
    // if (invitation.email !== req.user.email) {
    //   return res.status(403).json({ success: false, message: 'Esta invitación no es para tu correo electrónico' });
    // }

    res.json({
      success: true,
      data: { invitation }
    });
  } catch (error) {
    console.error('Error al obtener invitación:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al obtener la invitación'
    });
  }
});

// Aceptar invitación
router.post('/:token/accept', protect, async (req, res) => {
  try {
    const { token } = req.params;
    
    const invitation = await Invitation.findOne({ token, status: 'pending' });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'La invitación no existe, ha expirado o ya fue respondida'
      });
    }

    const project = await Project.findById(invitation.project);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'El proyecto ya no existe'
      });
    }

    // Verificar si el usuario ya es miembro
    if (project.isMember(req.user._id)) {
      invitation.status = 'accepted';
      await invitation.save();
      return res.status(400).json({
        success: false,
        message: 'Ya eres miembro de este proyecto'
      });
    }

    // Agregar miembro al proyecto
    project.addMember(req.user._id, invitation.role);
    await project.save();

    // Actualizar estado de la invitación
    invitation.accept(req.user._id);
    await invitation.save();

    res.json({
      success: true,
      message: 'Invitación aceptada exitosamente'
    });
  } catch (error) {
    console.error('Error al aceptar invitación:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al aceptar invitación'
    });
  }
});

// Rechazar invitación
router.post('/:token/decline', protect, async (req, res) => {
  try {
    const { token } = req.params;
    
    const invitation = await Invitation.findOne({ token, status: 'pending' });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'La invitación no existe, ha expirado o ya fue respondida'
      });
    }

    invitation.decline();
    await invitation.save();

    res.json({
      success: true,
      message: 'Invitación rechazada'
    });
  } catch (error) {
    console.error('Error al rechazar invitación:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al rechazar invitación'
    });
  }
});

module.exports = router;
