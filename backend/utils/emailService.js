const nodemailer = require('nodemailer');
const crypto = require('crypto');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendVerificationEmail(user, token) {
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
      
      const mailOptions = {
        from: `"EduTask" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: 'Verifica tu correo electrónico - EduTask',
        html: this.getVerificationEmailTemplate(user, verificationUrl)
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(user, token) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
      
      const mailOptions = {
        from: `"EduTask" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: 'Restablecer tu contraseña - EduTask',
        html: this.getPasswordResetEmailTemplate(user, resetUrl)
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  }

  async sendInvitationEmail(invitation, project, inviter) {
    try {
      const invitationUrl = `${process.env.FRONTEND_URL}/invitation/${invitation.token}`;
      
      const mailOptions = {
        from: `"EduTask" <${process.env.SMTP_USER}>`,
        to: invitation.email,
        subject: `Invitación para unirte al proyecto "${project.name}" - EduTask`,
        html: this.getInvitationEmailTemplate(invitation, project, inviter, invitationUrl)
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending invitation email:', error.message || error);
      return false;
    }
  }

  getVerificationEmailTemplate(user, verificationUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verificación de Correo - EduTask</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9f9f9; }
          .button { 
            display: inline-block; 
            padding: 12px 30px; 
            background: #4F46E5; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
          }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 EduTask</h1>
            <p>Verificación de Correo Electrónico</p>
          </div>
          <div class="content">
            <h2>¡Hola ${user.firstName}!</h2>
            <p>Gracias por registrarte en EduTask. Para completar tu registro, por favor verifica tu correo electrónico haciendo clic en el siguiente botón:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verificar Correo Electrónico</a>
            </div>
            <p>Si el botón no funciona, también puedes copiar y pegar este enlace en tu navegador:</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
            <p><strong>Importante:</strong> Este enlace expirará en 24 horas.</p>
          </div>
          <div class="footer">
            <p>© 2024 EduTask - Sistema de Gestión de Tareas SCRUM</p>
            <p>Este es un correo automático, por favor no responder a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordResetEmailTemplate(user, resetCode) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Restablecer Contraseña - EduTask</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #DC2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9f9f9; text-align: center; }
          .code { 
            display: inline-block; 
            padding: 15px 40px; 
            background: #ffeaea; 
            color: #DC2626; 
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            border-radius: 8px; 
            margin: 30px 0;
            border: 2px dashed #DC2626;
          }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 EduTask</h1>
            <p>Código de Verificación</p>
          </div>
          <div class="content">
            <h2>¡Hola ${user.firstName}!</h2>
            <p>Hemos recibido una solicitud para restablecer tu contraseña en EduTask. Utiliza el siguiente código de 6 dígitos para verificar tu identidad y cambiar tu contraseña:</p>
            <div class="code">${resetCode}</div>
            <p><strong>Importante:</strong> Este código expirará en 15 minutos por razones de seguridad.</p>
            <p>Si no realizaste esta solicitud, puedes ignorar este correo de forma segura.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} EduTask - Sistema de Gestión de Tareas SCRUM</p>
            <p>Este es un correo automático, por favor no responder a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getInvitationEmailTemplate(invitation, project, inviter, invitationUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invitación a Proyecto - EduTask</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9f9f9; }
          .button { 
            display: inline-block; 
            padding: 12px 30px; 
            background: #10B981; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0;
          }
          .project-info { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 EduTask</h1>
            <p>Invitación a Proyecto</p>
          </div>
          <div class="content">
            <h2>¡Hola!</h2>
            <p>${inviter.fullName} te ha invitado a unirte al proyecto <strong>"${project.name}"</strong> en EduTask.</p>
            
            <div class="project-info">
              <h3>Información del Proyecto</h3>
              <p><strong>Nombre:</strong> ${project.name}</p>
              <p><strong>Clave:</strong> ${project.key}</p>
              <p><strong>Tipo:</strong> ${project.type}</p>
              ${project.description ? `<p><strong>Descripción:</strong> ${project.description}</p>` : ''}
              <p><strong>Rol asignado:</strong> ${invitation.role}</p>
            </div>
            
            ${invitation.message ? `
              <div class="project-info">
                <h3>Mensaje del Invitador</h3>
                <p>"${invitation.message}"</p>
              </div>
            ` : ''}
            
            <p>Para aceptar la invitación, haz clic en el siguiente botón:</p>
            <div style="text-align: center;">
              <a href="${invitationUrl}" class="button">Aceptar Invitación</a>
            </div>
            <p>Si el botón no funciona, también puedes copiar y pegar este enlace en tu navegador:</p>
            <p><a href="${invitationUrl}">${invitationUrl}</a></p>
            <p><strong>Importante:</strong> Esta invitación expirará en 7 días.</p>
          </div>
          <div class="footer">
            <p>© 2024 EduTask - Sistema de Gestión de Tareas SCRUM</p>
            <p>Este es un correo automático, por favor no responder a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  generatePasswordResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }
}

module.exports = new EmailService();
