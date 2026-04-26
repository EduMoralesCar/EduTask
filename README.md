# 🚀 EduTask - Sistema de Gestión de Tareas SCRUM

EduTask es un sistema completo de gestión de proyectos y tareas similar a JIRA, diseñado para equipos que utilizan metodologías ágiles como SCRUM. Ofrece funcionalidades avanzadas de colaboración, gestión de proyectos y seguimiento de tareas.

## ✨ Características Principales

### 🔐 Autenticación y Seguridad
- Sistema de registro y login seguro
- Verificación de correos electrónicos
- Recuperación de contraseña por correo
- Tokens JWT para autenticación
- Validaciones de seguridad robustas

### 📊 Gestión de Proyectos
- Creación y gestión de proyectos
- Soporte para SCRUM, Kanban y Waterfall
- Roles de usuario (Administrador, Miembro, Desarrollador, Tester)
- Sistema de invitaciones por correo
- Confirmación de eliminación de proyectos

### 📋 Gestión de Tareas
- Creación y gestión de tareas
- Tipos de tareas (Historias, Tareas, Bugs, Épicas, Subtareas)
- Prioridades y estados personalizables
- Asignación de tareas a usuarios
- Comentarios y seguimiento de cambios
- Story points y estimaciones

### 👥 Colaboración
- Invitación de miembros por correo
- Gestión de roles y permisos
- Notificaciones en tiempo real
- Actividad y comentarios en tareas

### 🎯 Metodologías Ágiles
- Sprints y gestión de backlog
- Burndown charts
- Velocity tracking
- Tableros Kanban

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación
- **Nodemailer** - Envío de correos
- **bcryptjs** - Encriptación de contraseñas

### Frontend
- **React** - Framework de UI
- **TypeScript** - Tipado estático
- **Material-UI (MUI)** - Biblioteca de componentes
- **React Router** - Enrutamiento
- **React Hook Form** - Formularios
- **Yup** - Validación de esquemas
- **Axios** - Cliente HTTP

## 📋 Requisitos Previos

- Node.js (v16 o superior)
- MongoDB (v4.4 o superior)
- npm o yarn
- Cuenta de correo para envío de emails (Gmail, Outlook, etc.)

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone <repositorio-url>
cd EduTask
```

### 2. Configurar el Backend
```bash
cd backend
npm install
```

### 3. Configurar variables de entorno del Backend
```bash
cp .env.example .env
```

Edita el archivo `.env` con tu configuración:
```env
# Configuración del Servidor
PORT=5000
NODE_ENV=development

# Base de Datos MongoDB
MONGODB_URI=mongodb://localhost:27017/edutask

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Configuración de Correo (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# URL del Frontend
FRONTEND_URL=http://localhost:3000
```

### 4. Configurar el Frontend
```bash
cd ../frontend
npm install
```

### 5. Configurar variables de entorno del Frontend
```bash
cp .env.example .env
```

Edita el archivo `.env`:
```env
# URL del Backend API
REACT_APP_API_URL=http://localhost:5000/api

# Configuración de la aplicación
REACT_APP_NAME=EduTask
REACT_APP_VERSION=1.0.0
```

## 🏃‍♂️ Ejecución

### 1. Iniciar MongoDB
Asegúrate de que MongoDB esté corriendo en tu sistema.

### 2. Iniciar el Backend
```bash
cd backend
npm run dev
```

El backend iniciará en `http://localhost:5000`

### 3. Iniciar el Frontend
```bash
cd frontend
npm start
```

El frontend iniciará en `http://localhost:3000`

## 📧 Configuración de Correo

Para Gmail:
1. Activa la autenticación de dos factores
2. Genera una "Contraseña de aplicación"
3. Usa esa contraseña en `SMTP_PASS`

Para otros proveedores:
- Outlook: Configura SMTP con tus credenciales
- SendGrid: Usa tu API key
- Mailgun: Configura según su documentación

