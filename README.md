<div align="center">
  <img width="512" height="279" alt="image" src="https://github.com/user-attachments/assets/97122c02-8072-4498-85bb-e111781418f0" />
  
  # 
  
  **Sistema Integral de Gestión de Tareas y Proyectos Ágiles**

  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
  [![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](#)
  [![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](#)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](#)
</div>

<hr/>

## 📖 ¿Qué es EduTask?

**EduTask** es una plataforma avanzada de gestión de proyectos diseñada para facilitar el trabajo en equipo mediante metodologías ágiles como **SCRUM** y **Kanban**. 
Similar a herramientas de la industria como JIRA, EduTask permite a los equipos planificar, rastrear y entregar software de manera eficiente, ofreciendo una experiencia fluida, interactiva y centralizada.

✨ **Características Destacadas:**
- 🔐 **Seguridad:** Sistema de autenticación robusto con JWT y roles de usuario.
- 📊 **Interactividad:** Tableros Kanban dinámicos para el seguimiento de tareas.
- 👥 **Colaboración:** Gestión de miembros, invitaciones por correo y notificaciones.
- 🎯 **Agilidad:** Soporte nativo para sprints, épicas, historias de usuario y estimaciones.

---

## 🛠️ Herramientas de Desarrollo (Tech Stack)

El proyecto está construido sobre un stack moderno y escalable (MERN Stack + TypeScript), garantizando un alto rendimiento:

### 🌐 Frontend (Cliente)
- **React.js** & **TypeScript** - Construcción de interfaces de usuario tipadas y seguras.
- **Material-UI (MUI)** - Sistema de diseño y componentes visuales atractivos.
- **React Router** - Enrutamiento dinámico en el lado del cliente.
- **Axios** - Cliente HTTP para el consumo eficiente de la API.

### ⚙️ Backend (Servidor)
- **Node.js** & **Express.js** - Lógica del servidor, enrutamiento y API RESTful.
- **MongoDB** & **Mongoose** - Base de datos NoSQL orientada a documentos y ODM.
- **JWT & bcryptjs** - Autenticación sin estado y encriptación segura de contraseñas.
- **Nodemailer** - Servicio integrado para el envío de correos transaccionales.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instaladas las siguientes herramientas en tu entorno local:

- 🟢 **[Node.js](https://nodejs.org/)** (v16.x o versión superior).
- 🍃 **[MongoDB](https://www.mongodb.com/)** (v4.4 o superior) ejecutándose localmente, o una URI de conexión de MongoDB Atlas.
- 📦 **npm** (incluido con Node.js) o **Yarn** como gestor de paquetes.
- ✉️ Una cuenta de correo electrónico (ej. Gmail con contraseña de aplicación) para el envío de notificaciones.

---

## 🚀 Clonación y Ejecución Local

Sigue estos pasos para descargar el código fuente y levantar el proyecto en tu máquina local en cuestión de minutos.

### 1️⃣ Clonar el Repositorio

Abre tu terminal de preferencia y ejecuta el siguiente comando para clonar el proyecto a través de su enlace oficial:

```bash
git clone https://github.com/tu-usuario/EduTask.git
cd EduTask
```
> 💡 *Nota: Recuerda reemplazar `tu-usuario` por el nombre de usuario o la ruta real del repositorio en GitHub.*

### 2️⃣ Configurar y Levantar el Backend

```bash
# Navegar al directorio del servidor
cd backend

# Instalar todas las dependencias necesarias
npm install

# Generar el archivo de variables de entorno
cp .env.example .env
```

**Configura tu archivo `.env` (backend/.env) con los siguientes datos esenciales:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/edutask
JWT_SECRET=tu_secreto_super_seguro_jwt
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_contraseña_de_aplicacion
FRONTEND_URL=http://localhost:3000
```

**Iniciar el servidor backend en modo desarrollo:**
```bash
npm run dev
```

### 3️⃣ Configurar y Levantar el Frontend

Abre una nueva ventana o pestaña en tu terminal:

```bash
# Volver a la raíz y entrar al directorio del cliente
cd ../frontend

# Instalar las dependencias de la UI
npm install

# Generar el archivo de variables de entorno para React
cp .env.example .env
```

**Iniciar la aplicación web:**
```bash
npm start
```

🎉 **¡Todo listo!** 
- El cliente (Frontend) estará disponible interactivo en: `http://localhost:3000`
- La API (Backend) estará escuchando peticiones en: `http://localhost:5000`

---
