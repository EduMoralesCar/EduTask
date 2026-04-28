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
import { useAuth } from '../context/AuthContext';
import { RegisterData } from '../types';

const registerSchema = yup.object().shape({
  username: yup
    .string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(30, 'El nombre de usuario no puede exceder 30 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/, 'Solo puede contener letras, números y guiones bajos')
    .required('El nombre de usuario es obligatorio'),
  email: yup
    .string()
    .email('Ingrese un correo electrónico válido')
    .required('El correo electrónico es obligatorio'),
  password: yup
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Debe contener al menos una mayúscula, una minúscula y un número')
    .required('La contraseña es obligatoria'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Las contraseñas deben coincidir')
    .required('Confirma tu contraseña'),
  firstName: yup
    .string()
    .required('El nombre es obligatorio')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  lastName: yup
    .string()
    .required('El apellido es obligatorio')
    .max(50, 'El apellido no puede exceder 50 caracteres'),
});

const RegisterPage: React.FC = () => {
  const { register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData & { confirmPassword: string }>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    }
  });

  React.useEffect(() => {
    if (error) {
      setSubmitError(error);
      clearError();
    }
  }, [error, clearError]);

  const onSubmit = async (data: RegisterData & { confirmPassword: string }) => {
    try {
      setSubmitError(null);
      const { confirmPassword, ...registerData } = data;
      await register(registerData);
      navigate('/dashboard');
    } catch (err: any) {
      setSubmitError(err.message || 'Error al registrarse');
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
      <Box
        sx={{
          marginTop: 4,
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

          <Typography component="h2" variant="h5" sx={{ mb: 2 }}>
            Crear Cuenta
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Únete a EduTask y comienza a gestionar tus proyectos de manera eficiente
          </Typography>

          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    required
                    fullWidth
                    id="firstName"
                    label="Nombre"
                    autoComplete="given-name"
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                  />
                )}
              />

              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    required
                    fullWidth
                    id="lastName"
                    label="Apellido"
                    autoComplete="family-name"
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                  />
                )}
              />
            </Box>

            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Nombre de Usuario"
                  autoComplete="username"
                  error={!!errors.username}
                  helperText={errors.username?.message}
                />
              )}
            />

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
                  error={!!errors.email}
                  helperText={errors.email?.message}
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
                  label="Contraseña"
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
                  label="Confirmar Contraseña"
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
              {isLoading ? <CircularProgress size={24} /> : 'Crear Cuenta'}
            </Button>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Al registrarte, aceptas nuestros términos y condiciones. 
                Te enviaremos un correo para verificar tu cuenta.
              </Typography>
            </Box>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Typography component="span" color="primary">
                    Inicia Sesión
                  </Typography>
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;
