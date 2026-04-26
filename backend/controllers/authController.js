const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const emailService = require('../utils/emailService');

// Generar JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Registro de usuario
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errors.array()
      });
    }

    const { username, email, password, firstName, lastName } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? 'El correo electrónico ya está registrado' : 'El nombre de usuario ya está en uso'
      });
    }

    // Crear usuario
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName
    });

    // Generar token de verificación
    const verificationToken = emailService.generateVerificationToken();
    user.emailVerificationToken = verificationToken;

    await user.save();

    // Enviar correo de verificación
    const emailSent = await emailService.sendVerificationEmail(user, verificationToken);
    if (!emailSent) {
      console.warn('⚠️ No se pudo enviar el correo de verificación. Usa este enlace:');
      console.warn(`➡️ ${process.env.FRONTEND_URL}/verify-email/${verificationToken}`);
    }

    // Generar token JWT
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente. Por favor verifica tu correo electrónico.',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          isEmailVerified: user.isEmailVerified,
          preferences: user.preferences
        }
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al registrar usuario'
    });
  }
};

// Login de usuario
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Buscar usuario con password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Tu cuenta ha sido desactivada'
      });
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Actualizar último login
    user.lastLogin = new Date();
    await user.save();

    // Generar token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          isEmailVerified: user.isEmailVerified,
          preferences: user.preferences,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al iniciar sesión'
    });
  }
};

// Verificar correo electrónico
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ emailVerificationToken: token });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token de verificación inválido o expirado'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Correo electrónico verificado exitosamente'
    });
  } catch (error) {
    console.error('Error en verificación de correo:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al verificar correo'
    });
  }
};

// Reenviar correo de verificación
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico ya está verificado'
      });
    }

    // Generar nuevo token
    const verificationToken = emailService.generateVerificationToken();
    user.emailVerificationToken = verificationToken;
    await user.save();

    // Enviar correo
    const emailSent = await emailService.sendVerificationEmail(user, verificationToken);

    if (!emailSent) {
      console.warn('⚠️ No se pudo enviar el correo de verificación. Usa este enlace:');
      console.warn(`➡️ ${process.env.FRONTEND_URL}/verify-email/${verificationToken}`);
    }

    res.json({
      success: true,
      message: 'Correo de verificación enviado exitosamente'
    });
  } catch (error) {
    console.error('Error al reenviar verificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al reenviar correo de verificación'
    });
  }
};

const emailValidator = require('deep-email-validator');

// Solicitar restablecimiento de contraseña
const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Validar existencia real del correo
    const { valid, reason, validators } = await emailValidator.validate(email);
    if (!valid) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico no parece existir o es inválido',
        reason: validators[reason]?.reason || reason
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No existe una cuenta con este correo electrónico'
      });
    }

    // Generar código de 6 dígitos
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutos
    await user.save();

    // Enviar correo
    const emailSent = await emailService.sendPasswordResetEmail(user, resetToken);

    if (!emailSent) {
      console.warn('⚠️ No se pudo enviar el correo (¿Faltan credenciales SMTP?). Usa este enlace de recuperación:');
      console.warn(`➡️ ${process.env.FRONTEND_URL}/reset-password/${resetToken}`);
    }

    res.json({
      success: true,
      message: 'Correo de restablecimiento procesado exitosamente',
      data: {
        fallbackUrl: !emailSent ? `${process.env.FRONTEND_URL}/reset-password/${resetToken}` : undefined,
        fallbackToken: !emailSent ? resetToken : undefined
      }
    });
  } catch (error) {
    console.error('Error en forgot password:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al procesar solicitud'
    });
  }
};

// Restablecer contraseña
const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errors.array()
      });
    }

    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    // Actualizar contraseña
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Contraseña restablecida exitosamente'
    });
  } catch (error) {
    console.error('Error en reset password:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al restablecer contraseña'
    });
  }
};

// Obtener perfil del usuario actual
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          preferences: user.preferences,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al obtener perfil'
    });
  }
};

// Actualizar perfil
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errors.array()
      });
    }

    const { firstName, lastName, preferences, avatar } = req.body;

    const user = await User.findById(req.user._id);

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (avatar) user.avatar = avatar;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          preferences: user.preferences
        }
      }
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al actualizar perfil'
    });
  }
};

// Cambiar contraseña
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    // Verificar contraseña actual
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña actual es incorrecta'
      });
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al cambiar contraseña'
    });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword
};
