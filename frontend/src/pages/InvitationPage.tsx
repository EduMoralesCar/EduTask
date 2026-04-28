import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Chip,
} from '@mui/material';
import { CheckCircle, Error as ErrorIcon, Assignment, People } from '@mui/icons-material';
import { apiService } from '../services/api';

const InvitationPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadInvitation = async () => {
      if (!token) {
        setError('Token de invitación no proporcionado');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await apiService.getInvitation(token);
        
        if (response.success && response.data) {
          setInvitation(response.data);
        } else {
          setError(response.message || 'Error al cargar la invitación');
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar la invitación');
      } finally {
        setIsLoading(false);
      }
    };
    loadInvitation();
  }, [token]);

  const handleAcceptInvitation = async () => {
    if (!token) return;

    try {
      setIsProcessing(true);
      setError(null);
      
      const response = await apiService.acceptInvitation(token);
      
      if (response.success) {
        setSuccess('¡Invitación aceptada exitosamente! Ya eres miembro del proyecto.');
        setTimeout(() => navigate('/dashboard'), 3000);
      } else {
        setError(response.message || 'Error al aceptar la invitación');
      }
    } catch (err: any) {
      setError(err.message || 'Error al aceptar la invitación');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineInvitation = async () => {
    if (!token) return;

    try {
      setIsProcessing(true);
      setError(null);
      
      const response = await apiService.declineInvitation(token);
      
      if (response.success) {
        setSuccess('Invitación rechazada. Serás redirigido al dashboard.');
        setTimeout(() => navigate('/dashboard'), 3000);
      } else {
        setError(response.message || 'Error al rechazar la invitación');
      }
    } catch (err: any) {
      setError(err.message || 'Error al rechazar la invitación');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper elevation={3} sx={{ padding: 4, width: '100%', textAlign: 'center' }}>
            <Typography variant="h4" color="primary" sx={{ mb: 3, fontWeight: 'bold' }}>
              🚀 EduTask
            </Typography>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Cargando invitación...
            </Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  if (error && !invitation) {
    return (
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper elevation={3} sx={{ padding: 4, width: '100%', textAlign: 'center' }}>
            <Typography variant="h4" color="primary" sx={{ mb: 3, fontWeight: 'bold' }}>
              🚀 EduTask
            </Typography>
            <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
            <Typography component="h2" variant="h5" sx={{ mb: 2 }}>
              Invitación Inválida
            </Typography>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              El enlace de invitación es inválido o ha expirado. Por favor, contacta a la persona que te invitó.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              size="large"
            >
              Ir a Iniciar Sesión
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%', textAlign: 'center' }}>
          <Typography variant="h4" color="primary" sx={{ mb: 3, fontWeight: 'bold' }}>
            🚀 EduTask
          </Typography>

          {success ? (
            <>
              <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography component="h2" variant="h5" sx={{ mb: 2 }}>
                ¡Proceso Completado!
              </Typography>
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
              <Typography variant="body2" color="text.secondary">
                Serás redirigido automáticamente...
              </Typography>
            </>
          ) : (
            <>
              <Typography component="h2" variant="h5" sx={{ mb: 2 }}>
                🎯 Has sido invitado a unirte a un proyecto
              </Typography>

              {invitation && (
                <Box sx={{ textAlign: 'left', mb: 3 }}>
                  <Paper variant="outlined" sx={{ p: 3, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Assignment sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography variant="h6">
                        {invitation.project.name}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip label={invitation.project.key} size="small" color="primary" />
                      <Chip label={`Rol: ${invitation.role}`} size="small" variant="outlined" />
                    </Box>

                    {invitation.project.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {invitation.project.description}
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <People sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Invitado por: {invitation.inviter.fullName}
                      </Typography>
                    </Box>

                    {invitation.message && (
                      <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                          "{invitation.message}"
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Box>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleAcceptInvitation}
                  disabled={isProcessing}
                  size="large"
                  startIcon={<CheckCircle />}
                >
                  {isProcessing ? <CircularProgress size={20} /> : 'Aceptar Invitación'}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDeclineInvitation}
                  disabled={isProcessing}
                  size="large"
                >
                  Rechazar
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary">
                Al aceptar, te unirás como miembro del proyecto y podrás colaborar en las tareas.
              </Typography>
            </>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" color="text.secondary">
            ¿Necesitas ayuda?{' '}
            <Button variant="text" size="small" onClick={() => navigate('/login')}>
              Contacta soporte
            </Button>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default InvitationPage;
