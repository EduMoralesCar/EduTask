import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Divider,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { apiService } from '../services/api';
import { ForgotPasswordData } from '../types';

const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .email('Ingrese un correo electrónico válido')
    .required('El correo electrónico es obligatorio'),
});

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fallbackToken, setFallbackToken] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    try {
      setIsLoading(true);
      setError(null);
      setFallbackToken(null);
      
      const response = await apiService.forgotPassword(data);
      
      if (response.success) {
        setIsSuccess(true);
        if (response.data?.fallbackToken) {
           setFallbackToken(response.data.fallbackToken);
        }
      } else {
        setError(response.message || 'Error al enviar correo de restablecimiento');
      }
    } catch (err: any) {
      setError(err.message || 'Error al enviar correo de restablecimiento');
    } finally {
      setIsLoading(false);
    }
  };

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
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
              🚀 EduTask
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Sistema de Gestión de Tareas SCRUM
            </Typography>
          </Box>

          {!isSuccess ? (
            <>
              <Typography component="h2" variant="h5" sx={{ mb: 2 }}>
                ¿Olvidaste tu contraseña?
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label="Correo Electrónico"
                      autoComplete="email"
                      autoFocus
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={isLoading}
                  size="large"
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Enviar Correo de Restablecimiento'}
                </Button>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ textAlign: 'center' }}>
                  <Link to="/login" style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" color="primary">
                      Volver a Iniciar Sesión
                    </Typography>
                  </Link>
                </Box>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    ¿No tienes una cuenta?{' '}
                    <Link to="/register" style={{ textDecoration: 'none' }}>
                      <Typography component="span" color="primary">
                        Regístrate
                      </Typography>
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </>
          ) : (
            <>
              <Typography component="h2" variant="h5" sx={{ mb: 2 }}>
                Código Enviado
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Hemos enviado un código de verificación de 6 dígitos a tu correo electrónico.
              </Typography>

              <Alert severity="success" sx={{ mb: 3 }}>
                El código expirará en 15 minutos.
              </Alert>

              {fallbackToken && (
                <Alert severity="warning" sx={{ mb: 3, wordBreak: 'break-all', textAlign: 'left' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Para propósitos de prueba, tu código de recuperación es:
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', letterSpacing: 2 }}>
                    {fallbackToken}
                  </Typography>
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setIsSuccess(false)}
                >
                  Reenviar código
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate(`/reset-password/${fallbackToken || ''}`)}
                >
                  Ingresar Código
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

export default ForgotPasswordPage;
