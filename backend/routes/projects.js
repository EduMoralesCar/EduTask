const express = require('express');
const { body } = require('express-validator');
const projectController = require('../controllers/projectController');
const { protect, requireProjectAdmin, requireProjectMember } = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// Validaciones
const createProjectValidation = [
  body('name')
    .notEmpty()
    .withMessage('El nombre del proyecto es obligatorio')
    .isLength({ max: 100 })
    .withMessage('El nombre no puede exceder 100 caracteres')
    .trim(),
  body('key')
    .notEmpty()
    .withMessage('La clave del proyecto es obligatoria')
    .isLength({ min: 2, max: 10 })
    .withMessage('La clave debe tener entre 2 y 10 caracteres')
    .matches(/^[A-Z][A-Z0-9]*$/)
    .withMessage('La clave debe empezar con letra y contener solo letras mayúsculas y números'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres')
    .trim(),
  body('type')
    .optional()
    .isIn(['scrum', 'kanban', 'waterfall'])
    .withMessage('El tipo debe ser scrum, kanban o waterfall')
];

const updateProjectValidation = [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('El nombre del proyecto no puede estar vacío')
    .isLength({ max: 100 })
    .withMessage('El nombre no puede exceder 100 caracteres')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres')
    .trim(),
  body('type')
    .optional()
    .isIn(['scrum', 'kanban', 'waterfall'])
    .withMessage('El tipo debe ser scrum, kanban o waterfall'),
  body('settings.allowInvitations')
    .optional()
    .isBoolean()
    .withMessage('allowInvitations debe ser true o false'),
  body('settings.requireApproval')
    .optional()
    .isBoolean()
    .withMessage('requireApproval debe ser true o false'),
  body('settings.defaultAssignee')
    .optional()
    .isMongoId()
    .withMessage('defaultAssignee debe ser un ID de usuario válido')
];

const addMemberValidation = [
  body('email')
    .isEmail()
    .withMessage('Por favor ingrese un correo electrónico válido')
    .normalizeEmail(),
  body('role')
    .isIn(['admin', 'member', 'developer', 'tester'])
    .withMessage('El rol debe ser admin, member, developer o tester'),
  body('message')
    .optional()
    .isLength({ max: 500 })
    .withMessage('El mensaje no puede exceder 500 caracteres')
    .trim()
];

const updateMemberRoleValidation = [
  body('role')
    .isIn(['admin', 'member', 'developer', 'tester'])
    .withMessage('El rol debe ser admin, member, developer o tester')
];

const deleteProjectValidation = [
  body('confirmationName')
    .notEmpty()
    .withMessage('Debes confirmar el nombre del proyecto')
    .trim()
];

// Rutas
router.post('/', createProjectValidation, projectController.createProject);
router.get('/', projectController.getUserProjects);
router.get('/:id', requireProjectMember, projectController.getProject);
router.put('/:id', requireProjectAdmin, updateProjectValidation, projectController.updateProject);
router.delete('/:id', deleteProjectValidation, projectController.deleteProject);
router.get('/:id/stats', requireProjectMember, projectController.getProjectStats);

// Gestión de miembros
router.post('/:id/members', requireProjectAdmin, addMemberValidation, projectController.addMember);
router.put('/:id/members/:userId', requireProjectAdmin, updateMemberRoleValidation, projectController.updateMemberRole);
router.delete('/:id/members/:userId', projectController.removeMember);

module.exports = router;
