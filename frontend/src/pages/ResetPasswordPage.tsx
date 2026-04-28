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
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { apiService } from '../services/api';

const resetPasswordSchema = yup.object().shape({
  code: yup
    .string()
    .length(6, 'El código debe tener exactamente 6 dígitos')
    .required('El código de verificación es obligatorio'),
  password: yup
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Debe contener al menos una mayúscula, una minúscula y un número')
    .required('La contraseña es obligatoria'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Las contraseñas deben coincidir')
    .required('Confirma tu contraseña'),
});

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<{ code: string; password: string; confirmPassword: string }>({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      code: '',
      password: '',
      confirmPassword: '',
    }
  });

  const onSubmit = async (data: { code: string; password: string; confirmPassword: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.resetPassword(data.code, { password: data.password });
      
      if (response.success) {
        setIsSuccess(true);
      } else {
        setError(response.message || 'Error al restablecer la contraseña');
      }
    } catch (err: any) {
      setError(err.message || 'Error al restablecer la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                Restablecer Contraseña
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Ingresa el código de 6 dígitos que enviamos a tu correo y tu nueva contraseña.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
                <Controller
                  name="code"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      margin="normal"
                      required
                      fullWidth
                      id="code"
                      label="Código de 6 dígitos"
                      autoFocus
                      error={!!errors.code}
                      helperText={errors.code?.message}
                      slotProps={{ htmlInput: { maxLength: 6, style: { letterSpacing: '8px', textAlign: 'center', fontSize: '20px', fontWeight: 'bold' } } }}
                    />
                  )}
                />

                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Nueva Contraseña"
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      autoComplete="new-password"
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleTogglePasswordVisibility}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      margin="normal"
                      required
                      fullWidth
                      name="confirmPassword"
                      label="Confirmar Nueva Contraseña"
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      autoComplete="new-password"
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle confirm password visibility"
                                onClick={handleToggleConfirmPasswordVisibility}
                                edge="end"
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
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
                  {isLoading ? <CircularProgress size={24} /> : 'Restablecer Contraseña'}
                </Button>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ textAlign: 'center' }}>
                  <Link to="/login" style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" color="primary">
                      Volver a Iniciar Sesión
                    </Typography>
                  </Link>
                </Box>
              </Box>
            </>
          ) : (
            <>
              <Typography component="h2" variant="h5" sx={{ mb: 2 }}>
                Contraseña Restablecida
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.
              </Typography>

              <Alert severity="success" sx={{ mb: 3 }}>
                ¡Tu cuenta está segura!
              </Alert>

              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="contained"
                  onClick={() => navigate('/login')}
                  size="large"
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

export default ResetPasswordPage;
