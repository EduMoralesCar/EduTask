const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para proteger rutas
const protect = async (req, res, next) => {
  try {
    let token;

    // Verificar si hay token en el header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Acceso denegado - no se proporcionó token' 
      });
    }

    try {
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Obtener usuario del token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Usuario no encontrado' 
        });
      }

      if (!user.isActive) {
        return res.status(401).json({ 
          success: false, 
          message: 'Usuario desactivado' 
        });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido' 
      });
    }
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error del servidor' 
    });
  }
};

// Middleware para verificar si el email está verificado
const requireEmailVerification = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({ 
      success: false, 
      message: 'Debes verificar tu correo electrónico para realizar esta acción' 
    });
  }
  next();
};

// Middleware para verificar rol de administrador del proyecto
const requireProjectAdmin = async (req, res, next) => {
  try {
    const Project = require('../models/Project');
    const projectId = req.params.projectId || req.params.id || req.body.project;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Proyecto no encontrado' 
      });
    }

    if (!project.isAdmin(req.user._id)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Se requieren permisos de administrador del proyecto' 
      });
    }

    req.project = project;
    next();
  } catch (error) {
    console.error('Error en middleware de administrador de proyecto:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error del servidor' 
    });
  }
};

// Middleware para verificar si es miembro del proyecto
const requireProjectMember = async (req, res, next) => {
  try {
    const Project = require('../models/Project');
    const projectId = req.params.projectId || req.params.id || req.body.project;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Proyecto no encontrado' 
      });
    }

    if (!project.isMember(req.user._id) && !project.isAdmin(req.user._id)) {
      return res.status(403).json({ 
        success: false, 
        message: 'No eres miembro de este proyecto' 
      });
    }

    req.project = project;
    next();
  } catch (error) {
    console.error('Error en middleware de miembro de proyecto:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error del servidor' 
    });
  }
};

// Middleware opcional - si no hay token, continúa sin usuario
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (jwtError) {
        // Token inválido, continuar sin usuario
      }
    }

    next();
  } catch (error) {
    console.error('Error en middleware opcional de autenticación:', error);
    next();
  }
};

module.exports = {
  protect,
  requireEmailVerification,
  requireProjectAdmin,
  requireProjectMember,
  optionalAuth
};
