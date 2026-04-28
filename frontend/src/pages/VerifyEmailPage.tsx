import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Paper,
  Alert,
  Button,
  Divider,
} from '@mui/material';
import { CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import { apiService } from '../services/api';

const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('Token de verificación no proporcionado');
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiService.verifyEmail(token);
        if (response.success) {
          setIsVerified(true);
        } else {
          setError(response.message || 'Error al verificar el correo');
        }
      } catch (err: any) {
        setError(err.message || 'Error al verificar el correo');
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

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
              Verificando tu correo electrónico...
            </Typography>
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

          {isVerified ? (
            <>
              <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography component="h2" variant="h5" sx={{ mb: 2 }}>
                ¡Correo Verificado Exitosamente!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Tu cuenta ha sido verificada. Ahora puedes iniciar sesión y comenzar a usar EduTask.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/login')}
                sx={{ mb: 2 }}
              >
                Iniciar Sesión
              </Button>
            </>
          ) : (
            <>
              <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
              <Typography component="h2" variant="h5" sx={{ mb: 2 }}>
                Error en la Verificación
              </Typography>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                El enlace de verificación es inválido o ha expirado. Por favor, solicita un nuevo correo de verificación.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/forgot-password')}
                >
                  Reenviar Verificación
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/login')}
                >
                  Iniciar Sesión
                </Button>
              </Box>
            </>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" color="text.secondary">
            ¿Necesitas ayuda?{' '}
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Typography component="span" color="primary">
                Contacta soporte
              </Typography>
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default VerifyEmailPage;
