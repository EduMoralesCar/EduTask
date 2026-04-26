const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Invitation = require('../models/Invitation');
const emailService = require('../utils/emailService');

// Crear proyecto
const createProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errors.array()
      });
    }

    const { name, key, description, type } = req.body;

    // Verificar si la clave del proyecto ya existe
    const existingProject = await Project.findOne({ key: key.toUpperCase() });
    if (existingProject) {
      return res.status(400).json({
        success: false,
        message: 'La clave del proyecto ya está en uso'
      });
    }

    // Crear proyecto
    const project = new Project({
      name,
      key: key.toUpperCase(),
      description,
      type: type || 'scrum',
      owner: req.user._id
    });

    // Agregar al creador como miembro administrador
    project.addMember(req.user._id, 'admin');

    await project.save();

    // Popular datos para respuesta
    await project.populate('owner', 'username firstName lastName email');
    await project.populate('members.user', 'username firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Proyecto creado exitosamente',
      data: { project }
    });
  } catch (error) {
    console.error('Error al crear proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al crear proyecto'
    });
  }
};

// Obtener proyectos del usuario
const getUserProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const projects = await Project.find({
      $and: [
        { status: { $ne: 'deleted' } },
        {
          $or: [
            { owner: userId },
            { 'members.user': userId }
          ]
        }
      ]
    })
    .populate('owner', 'username firstName lastName email avatar')
    .populate('members.user', 'username firstName lastName email avatar')
    .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: { projects }
    });
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al obtener proyectos'
    });
  }
};

// Obtener proyecto por ID
const getProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate('owner', 'username firstName lastName email avatar')
      .populate('members.user', 'username firstName lastName email avatar');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    // Verificar si el usuario tiene acceso
    if (!project.isMember(req.user._id) && !project.isAdmin(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a este proyecto'
      });
    }

    res.json({
      success: true,
      data: { project }
    });
  } catch (error) {
    console.error('Error al obtener proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al obtener proyecto'
    });
  }
};

// Actualizar proyecto
const updateProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { name, description, type, settings } = req.body;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    // Verificar permisos de administrador
    if (!project.isAdmin(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Se requieren permisos de administrador'
      });
    }

    // Actualizar campos
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (type) project.type = type;
    if (settings) project.settings = { ...project.settings, ...settings };

    await project.save();

    await project.populate('owner', 'username firstName lastName email');
    await project.populate('members.user', 'username firstName lastName email');

    res.json({
      success: true,
      message: 'Proyecto actualizado exitosamente',
      data: { project }
    });
  } catch (error) {
    console.error('Error al actualizar proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al actualizar proyecto'
    });
  }
};

// Eliminar proyecto (con verificación)
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmationName } = req.body;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    // Verificar si es el propietario
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Solo el propietario puede eliminar el proyecto'
      });
    }

    // Verificar confirmación
    if (!confirmationName || confirmationName !== project.name) {
      return res.status(400).json({
        success: false,
        message: 'Debes confirmar el nombre exacto del proyecto para eliminarlo'
      });
    }

    // Marcar como eliminado (soft delete)
    project.status = 'deleted';
    await project.save();

    // También marcar tareas como eliminadas
    await Task.updateMany(
      { project: id },
      { $set: { status: 'deleted' } }
    );

    // Cancelar invitaciones pendientes
    await Invitation.updateMany(
      { project: id, status: 'pending' },
      { $set: { status: 'expired' } }
    );

    res.json({
      success: true,
      message: 'Proyecto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al eliminar proyecto'
    });
  }
};

// Agregar miembro al proyecto
const addMember = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { email, role, message } = req.body;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    // Verificar permisos
    if (!project.isAdmin(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Se requieren permisos de administrador para agregar miembros'
      });
    }

    // Verificar si las invitaciones están permitidas
    if (!project.settings.allowInvitations) {
      return res.status(403).json({
        success: false,
        message: 'Las invitaciones no están permitidas en este proyecto'
      });
    }

    // Verificar si ya es miembro
    const User = require('../models/User');
    const existingUser = await User.findOne({ email });
    
    if (existingUser && project.isMember(existingUser._id)) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya es miembro del proyecto'
      });
    }

    // Crear invitación
    const invitation = new Invitation({
      project: id,
      inviter: req.user._id,
      email,
      role,
      message
    });

    await invitation.save();

    // Enviar correo de invitación
    const emailSent = await emailService.sendInvitationEmail(
      invitation,
      project,
      req.user
    );

    if (!emailSent) {
      console.warn('⚠️ No se pudo enviar el correo de invitación. Usa este enlace para aceptar:');
      console.warn(`➡️ ${process.env.FRONTEND_URL}/invitation/${invitation.token}`);
    }

    await invitation.populate('inviter', 'username firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Invitación enviada exitosamente',
      data: { invitation }
    });
  } catch (error) {
    console.error('Error al agregar miembro:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al agregar miembro'
    });
  }
};

// Actualizar rol de miembro
const updateMemberRole = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    // Verificar permisos (solo el propietario puede cambiar roles)
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Solo el propietario puede cambiar roles de miembros'
      });
    }

    // No se puede cambiar el rol del propietario
    if (project.owner.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'No se puede cambiar el rol del propietario'
      });
    }

    // Actualizar rol
    const member = project.members.find(m => m.user.toString() === userId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Miembro no encontrado en el proyecto'
      });
    }

    member.role = role;
    await project.save();

    await project.populate('members.user', 'username firstName lastName email');

    res.json({
      success: true,
      message: 'Rol actualizado exitosamente',
      data: { member }
    });
  } catch (error) {
    console.error('Error al actualizar rol de miembro:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al actualizar rol de miembro'
    });
  }
};

// Eliminar miembro del proyecto
const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    // Verificar permisos
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isSelf = userId === req.user._id.toString();
    const isAdmin = project.isAdmin(req.user._id);

    if (!isOwner && !isSelf && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar este miembro'
      });
    }

    // No se puede eliminar al propietario
    if (project.owner.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar al propietario del proyecto'
      });
    }

    // Un administrador no puede eliminar a otro administrador (solo el propietario puede)
    if (!isOwner && isAdmin) {
      const targetMember = project.members.find(m => m.user.toString() === userId);
      if (targetMember && targetMember.role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo el propietario puede eliminar a otros administradores'
        });
      }
    }

    project.removeMember(userId);
    await project.save();

    res.json({
      success: true,
      message: 'Miembro eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar miembro:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al eliminar miembro'
    });
  }
};

// Obtener estadísticas del proyecto
const getProjectStats = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    // Verificar acceso
    if (!project.isMember(req.user._id) && !project.isAdmin(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a este proyecto'
      });
    }

    // Obtener estadísticas de tareas
    const taskStats = await Task.aggregate([
      { $match: { project: project._id, status: { $ne: 'deleted' } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          storyPoints: { $sum: { $ifNull: ['$storyPoints', 0] } }
        }
      }
    ]);

    const totalTasks = await Task.countDocuments({ 
      project: project._id, 
      status: { $ne: 'deleted' } 
    });

    const completedTasks = await Task.countDocuments({ 
      project: project._id, 
      status: 'done' 
    });

    // Actualizar estadísticas del proyecto
    project.statistics.totalTasks = totalTasks;
    project.statistics.completedTasks = completedTasks;
    await project.save();

    res.json({
      success: true,
      data: {
        project: {
          id: project._id,
          name: project.name,
          key: project.key,
          memberCount: project.memberCount,
          statistics: project.statistics
        },
        taskStats
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al obtener estadísticas'
    });
  }
};

module.exports = {
  createProject,
  getUserProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  updateMemberRole,
  removeMember,
  getProjectStats
};
