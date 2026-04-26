const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validaciones
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('El nombre de usuario debe tener entre 3 y 30 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos'),
  body('email')
    .isEmail()
    .withMessage('Por favor ingrese un correo electrónico válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una letra mayúscula, una minúscula y un número'),
  body('firstName')
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ max: 50 })
    .withMessage('El nombre no puede exceder 50 caracteres')
    .trim(),
  body('lastName')
    .notEmpty()
    .withMessage('El apellido es obligatorio')
    .isLength({ max: 50 })
    .withMessage('El apellido no puede exceder 50 caracteres')
    .trim()
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Por favor ingrese un correo electrónico válido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Por favor ingrese un correo electrónico válido')
    .normalizeEmail()
];

const resetPasswordValidation = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una letra mayúscula, una minúscula y un número')
];

const updateProfileValidation = [
  body('firstName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El nombre no puede exceder 50 caracteres')
    .trim(),
  body('lastName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('El apellido no puede exceder 50 caracteres')
    .trim(),
  body('preferences.language')
    .optional()
    .isIn(['es', 'en'])
    .withMessage('El idioma debe ser español o inglés'),
  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark'])
    .withMessage('El tema debe ser light o dark'),
  body('preferences.notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Las notificaciones por correo deben ser true o false'),
  body('preferences.notifications.push')
    .optional()
    .isBoolean()
    .withMessage('Las notificaciones push deben ser true o false')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es obligatoria'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La nueva contraseña debe contener al menos una letra mayúscula, una minúscula y un número')
];

// Rutas públicas
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/forgot-password', forgotPasswordValidation, authController.forgotPassword);
router.put('/reset-password/:token', resetPasswordValidation, authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', forgotPasswordValidation, authController.resendVerificationEmail);

// Rutas protegidas
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, updateProfileValidation, authController.updateProfile);
router.put('/change-password', protect, changePasswordValidation, authController.changePassword);

module.exports = router;
