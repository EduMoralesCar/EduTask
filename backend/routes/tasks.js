const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Sprint = require('../models/Sprint');
const { protect, requireProjectMember } = require('../middleware/auth');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(protect);

// Validaciones
const createTaskValidation = [
  body('title')
    .notEmpty()
    .withMessage('El título de la tarea es obligatorio')
    .isLength({ max: 200 })
    .withMessage('El título no puede exceder 200 caracteres')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('La descripción no puede exceder 2000 caracteres')
    .trim(),
  body('project')
    .isMongoId()
    .withMessage('El proyecto es requerido'),
  body('type')
    .optional()
    .isIn(['story', 'task', 'bug', 'epic', 'subtask'])
    .withMessage('El tipo debe ser story, task, bug, epic o subtask'),
  body('priority')
    .optional()
    .isIn(['lowest', 'low', 'medium', 'high', 'highest'])
    .withMessage('La prioridad debe ser lowest, low, medium, high o highest'),
  body('assignee')
    .optional()
    .isMongoId()
    .withMessage('El asignado debe ser un ID de usuario válido'),
  body('storyPoints')
    .optional()
    .isInt({ min: 1, max: 21 })
    .withMessage('Los story points deben ser un número entre 1 y 21'),
  body('originalEstimate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('La estimación original debe ser un número positivo'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha de vencimiento debe ser válida')
];

const updateTaskValidation = [
  body('title')
    .optional()
    .notEmpty()
    .withMessage('El título no puede estar vacío')
    .isLength({ max: 200 })
    .withMessage('El título no puede exceder 200 caracteres')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('La descripción no puede exceder 2000 caracteres')
    .trim(),
  body('type')
    .optional()
    .isIn(['story', 'task', 'bug', 'epic', 'subtask'])
    .withMessage('El tipo debe ser story, task, bug, epic o subtask'),
  body('priority')
    .optional()
    .isIn(['lowest', 'low', 'medium', 'high', 'highest'])
    .withMessage('La prioridad debe ser lowest, low, medium, high o highest'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'in-review', 'done', 'blocked'])
    .withMessage('El estado debe ser todo, in-progress, in-review, done o blocked'),
  body('assignee')
    .optional()
    .isMongoId()
    .withMessage('El asignado debe ser un ID de usuario válido'),
  body('storyPoints')
    .optional()
    .isInt({ min: 1, max: 21 })
    .withMessage('Los story points deben ser un número entre 1 y 21'),
  body('originalEstimate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('La estimación original debe ser un número positivo'),
  body('remainingEstimate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('La estimación restante debe ser un número positivo'),
  body('timeSpent')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El tiempo gastado debe ser un número positivo'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha de vencimiento debe ser válida')
];

const addCommentValidation = [
  body('content')
    .notEmpty()
    .withMessage('El contenido del comentario es obligatorio')
    .isLength({ max: 1000 })
    .withMessage('El comentario no puede exceder 1000 caracteres')
    .trim()
];

// Crear tarea
router.post('/', createTaskValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errors.array()
      });
    }

    const { project, ...taskData } = req.body;

    // Verificar acceso al proyecto
    const Project = require('../models/Project');
    const projectDoc = await Project.findById(project);

    if (!projectDoc) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    if (!projectDoc.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'No eres miembro de este proyecto'
      });
    }

    // Generar key y number
    const lastTask = await Task.findOne({ project }).sort('-number');
    const number = lastTask ? lastTask.number + 1 : 1;
    const key = `${projectDoc.key}-${number}`;

    // Crear tarea
    const task = new Task({
      ...taskData,
      project,
      reporter: req.user._id,
      number,
      key
    });

    await task.save();

    // Popular datos para respuesta
    await task.populate('project', 'name key');
    await task.populate('reporter', 'username firstName lastName avatar');
    await task.populate('assignee', 'username firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Tarea creada exitosamente',
      data: { task }
    });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al crear tarea'
    });
  }
});

// Obtener tareas asignadas al usuario actual
router.get('/my-tasks', async (req, res) => {
  try {
    const tasks = await Task.find({ assignee: req.user._id })
      .populate('project', 'name key')
      .populate('reporter', 'username firstName lastName avatar');

    res.json({
      success: true,
      data: { tasks }
    });
  } catch (error) {
    console.error('Error al obtener mis tareas:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al obtener tareas'
    });
  }
});

// Obtener tareas de un proyecto
router.get('/project/:projectId', requireProjectMember, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { 
      status, 
      assignee, 
      type, 
      priority, 
      sprint,
      page = 1, 
      limit = 50,
      sort = '-createdAt'
    } = req.query;

    // Construir filtros
    const filter = { 
      project: projectId, 
      status: { $ne: 'deleted' } 
    };

    if (status) filter.status = status;
    if (assignee) filter.assignee = assignee;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (sprint) filter.sprint = sprint;

    // Opciones de paginación
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      populate: [
        { path: 'reporter', select: 'username firstName lastName avatar' },
        { path: 'assignee', select: 'username firstName lastName avatar' },
        { path: 'sprint', select: 'name state' }
      ]
    };

    const tasks = await Task.paginate(filter, options);

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al obtener tareas'
    });
  }
});

// Obtener tarea por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate('project', 'name key')
      .populate('reporter', 'username firstName lastName avatar')
      .populate('assignee', 'username firstName lastName avatar')
      .populate('sprint', 'name state')
      .populate('epic', 'title fullKey')
      .populate('parent', 'title fullKey')
      .populate('subtasks', 'title fullKey status')
      .populate('comments.author', 'username firstName lastName avatar')
      .populate('watchers', 'username firstName lastName avatar');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    // Verificar acceso al proyecto
    const Project = require('../models/Project');
    const project = await Project.findById(task.project._id);

    if (!project.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta tarea'
      });
    }

    res.json({
      success: true,
      data: { task }
    });
  } catch (error) {
    console.error('Error al obtener tarea:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al obtener tarea'
    });
  }
});

// Actualizar tarea
router.put('/:id', updateTaskValidation, async (req, res) => {
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
    const updates = req.body;

    const task = await Task.findById(id).populate('project');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    // Verificar acceso al proyecto
    const Project = require('../models/Project');
    const project = await Project.findById(task.project._id);

    if (!project.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta tarea'
      });
    }

    // Actualizar campos
    Object.keys(updates).forEach(key => {
      if (key !== 'project' && key !== 'reporter') {
        task[key] = updates[key];
      }
    });

    // Si el estado cambia a "done", marcar como resuelta
    if (updates.status === 'done' && task.status !== 'done') {
      task.resolve('done', req.user._id);
    }

    await task.save();

    // Popular datos para respuesta
    await task.populate('reporter', 'username firstName lastName avatar');
    await task.populate('assignee', 'username firstName lastName avatar');
    await task.populate('sprint', 'name state');

    res.json({
      success: true,
      message: 'Tarea actualizada exitosamente',
      data: { task }
    });
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al actualizar tarea'
    });
  }
});

// Eliminar tarea (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id).populate('project');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    // Verificar acceso al proyecto
    const Project = require('../models/Project');
    const project = await Project.findById(task.project._id);

    if (!project.isAdmin(req.user._id) && task.reporter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar esta tarea'
      });
    }

    // Soft delete
    task.status = 'deleted';
    await task.save();

    res.json({
      success: true,
      message: 'Tarea eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al eliminar tarea'
    });
  }
});

// Agregar comentario
router.post('/:id/comments', addCommentValidation, async (req, res) => {
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
    const { content } = req.body;

    const task = await Task.findById(id).populate('project');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    // Verificar acceso al proyecto
    const Project = require('../models/Project');
    const project = await Project.findById(task.project._id);

    if (!project.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta tarea'
      });
    }

    // Agregar comentario
    task.addComment(req.user._id, content);
    await task.save();

    // Popular el nuevo comentario
    await task.populate('comments.author', 'username firstName lastName avatar');

    const newComment = task.comments[task.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comentario agregado exitosamente',
      data: { comment: newComment }
    });
  } catch (error) {
    console.error('Error al agregar comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al agregar comentario'
    });
  }
});

// Agregar/eliminar watcher
router.post('/:id/watchers', async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id).populate('project');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    // Verificar acceso al proyecto
    const Project = require('../models/Project');
    const project = await Project.findById(task.project._id);

    if (!project.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta tarea'
      });
    }

    task.addWatcher(req.user._id);
    await task.save();

    res.json({
      success: true,
      message: 'Agregado como observador'
    });
  } catch (error) {
    console.error('Error al agregar watcher:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al agregar observador'
    });
  }
});

router.delete('/:id/watchers', async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id).populate('project');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    // Verificar acceso al proyecto
    const Project = require('../models/Project');
    const project = await Project.findById(task.project._id);

    if (!project.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta tarea'
      });
    }

    task.removeWatcher(req.user._id);
    await task.save();

    res.json({
      success: true,
      message: 'Eliminado como observador'
    });
  } catch (error) {
    console.error('Error al eliminar watcher:', error);
    res.status(500).json({
      success: false,
      message: 'Error del servidor al eliminar observador'
    });
  }
});

module.exports = router;
