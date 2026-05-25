require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/edutask';
    console.log(`🔌 Conectando a MongoDB en: ${mongoUri}...`);
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('🗑️ Limpiando la base de datos...');
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({})
    ]);
    console.log('✅ Base de datos limpia.');

    console.log('👥 Creando usuarios de prueba...');
    
    // Crear usuarios (la contraseña será encriptada por el middleware pre-save del modelo User)
    const admin = new User({
      username: 'edu_admin',
      email: 'edumoraloscarlos@gmail.com',
      password: 'Password123',
      firstName: 'Eduardo',
      lastName: 'Administrador',
      isEmailVerified: true,
      preferences: { language: 'es', theme: 'light' }
    });

    const developer = new User({
      username: 'diana_dev',
      email: 'diana.dev@edutask.com',
      password: 'Password123',
      firstName: 'Diana',
      lastName: 'Desarrolladora',
      isEmailVerified: true,
      preferences: { language: 'es', theme: 'light' }
    });

    const tester = new User({
      username: 'tomas_tester',
      email: 'tomas.tester@edutask.com',
      password: 'Password123',
      firstName: 'Tomas',
      lastName: 'Tester',
      isEmailVerified: true,
      preferences: { language: 'es', theme: 'light' }
    });

    await Promise.all([admin.save(), developer.save(), tester.save()]);
    console.log('✅ Usuarios creados con éxito:');
    console.log(`   - Eduardo Admin (edumoraloscarlos@gmail.com / Password123)`);
    console.log(`   - Diana Dev (diana.dev@edutask.com / Password123)`);
    console.log(`   - Tomas Tester (tomas.tester@edutask.com / Password123)`);

    console.log('📁 Creando proyectos parecidos a JIRA...');
    
    // Proyecto 1: EduTask Agile Development
    const projectAgile = new Project({
      name: 'EduTask Agile Development',
      key: 'EDU',
      description: 'Proyecto principal para el diseño e implementación de la plataforma EduTask usando metodologías ágiles.',
      owner: admin._id,
      type: 'scrum',
      members: [
        { user: admin._id, role: 'admin' },
        { user: developer._id, role: 'developer' },
        { user: tester._id, role: 'tester' }
      ]
    });

    // Proyecto 2: EduTask Marketing & Sales
    const projectMarketing = new Project({
      name: 'EduTask Marketing & Lanzamiento',
      key: 'MKT',
      description: 'Tablón Kanban para planificar la campaña de marketing y el lanzamiento oficial de EduTask.',
      owner: admin._id,
      type: 'kanban',
      members: [
        { user: admin._id, role: 'admin' },
        { user: developer._id, role: 'member' },
        { user: tester._id, role: 'tester' }
      ]
    });

    await Promise.all([projectAgile.save(), projectMarketing.save()]);
    console.log('✅ Proyectos creados.');

    console.log('🎯 Creando tareas para el proyecto Agile (EDU)...');

    // Creamos tareas para el Proyecto Agile
    const task1 = new Task({
      title: 'Diseño de Base de Datos y Modelos',
      description: 'Definir el esquema relacional en MongoDB para usuarios, proyectos, tareas y comentarios utilizando Mongoose en Express.',
      project: projectAgile._id,
      reporter: admin._id,
      assignee: developer._id,
      type: 'task',
      priority: 'highest',
      status: 'done',
      storyPoints: 5,
      originalEstimate: 8,
      timeSpent: 8
    });

    const task2 = new Task({
      title: 'Implementar Autenticación de Usuarios JWT',
      description: 'Desarrollar el backend para registro, login y restablecimiento de contraseñas de forma segura con JWT y encriptación bcryptjs.',
      project: projectAgile._id,
      reporter: admin._id,
      assignee: developer._id,
      type: 'story',
      priority: 'high',
      status: 'in-progress',
      storyPoints: 8,
      originalEstimate: 12,
      timeSpent: 4,
      remainingEstimate: 8
    });

    const task3 = new Task({
      title: 'Bug: Formulario de recuperación rompe diseño',
      description: 'El correo electrónico de restablecimiento envía la URL en lugar de enviar el código de 6 dígitos, rompiendo la caja de diseño en el buzón.',
      project: projectAgile._id,
      reporter: tester._id,
      assignee: developer._id,
      type: 'bug',
      priority: 'high',
      status: 'todo',
      storyPoints: 2,
      originalEstimate: 4
    });

    const task4 = new Task({
      title: 'Diseñar interfaz JIRA del Tablero Kanban principal',
      description: 'Construir el frontend en React utilizando Material-UI (MUI) con columnas dinámicas, drag & drop y excelente aspecto visual premium.',
      project: projectAgile._id,
      reporter: admin._id,
      assignee: admin._id,
      type: 'story',
      priority: 'medium',
      status: 'in-review',
      storyPoints: 13,
      originalEstimate: 20,
      timeSpent: 18,
      remainingEstimate: 2
    });

    const task5 = new Task({
      title: 'Escribir Pruebas Unitarias para Autenticación',
      description: 'Crear suite de pruebas utilizando Jest y Supertest para validar el registro y login en el backend.',
      project: projectAgile._id,
      reporter: developer._id,
      assignee: tester._id,
      type: 'task',
      priority: 'medium',
      status: 'todo',
      storyPoints: 3,
      originalEstimate: 6
    });

    // Guardar tareas ágiles de forma secuencial para evitar la condición de carrera en la generación del número de tarea
    const agileTasks = [task1, task2, task3, task4, task5];
    for (const task of agileTasks) {
      await task.save();
    }

    console.log('🎯 Creando tareas para el proyecto Marketing (MKT)...');
    
    // Creamos tareas para el Proyecto Marketing
    const taskM1 = new Task({
      title: 'Crear Landing Page atractiva del producto',
      description: 'Diseñar y maquetar una página de aterrizaje con glassmorphism y microanimaciones para capturar leads antes del lanzamiento.',
      project: projectMarketing._id,
      reporter: admin._id,
      assignee: developer._id,
      type: 'story',
      priority: 'high',
      status: 'in-progress',
      storyPoints: 5,
      originalEstimate: 10,
      timeSpent: 2,
      remainingEstimate: 8
    });

    const taskM2 = new Task({
      title: 'Definir canales de marketing digital',
      description: 'Seleccionar canales como LinkedIn y correos fríos dirigidos a equipos de desarrollo estudiantil.',
      project: projectMarketing._id,
      reporter: admin._id,
      assignee: admin._id,
      type: 'task',
      priority: 'medium',
      status: 'done',
      storyPoints: 3,
      originalEstimate: 6,
      timeSpent: 6
    });

    // Guardar tareas de marketing de forma secuencial
    const marketingTasks = [taskM1, taskM2];
    for (const task of marketingTasks) {
      await task.save();
    }

    // Actualizar estadísticas de proyectos
    projectAgile.statistics = {
      totalTasks: 5,
      completedTasks: 1,
      activeSprints: 0
    };
    projectMarketing.statistics = {
      totalTasks: 2,
      completedTasks: 1,
      activeSprints: 0
    };

    await Promise.all([projectAgile.save(), projectMarketing.save()]);

    console.log('✅ Base de datos sembrada con éxito 🎉');
    console.log('💡 Ejecuta "node seed.js" cada vez que quieras restablecer y repoblar tus datos de prueba.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error sembrando la base de datos:', error);
    process.exit(1);
  }
};

seedDatabase();
