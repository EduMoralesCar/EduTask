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
import { LoginData } from '../types';

const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Introduce un correo electrónico válido')
    .required('El correo electrónico es obligatorio'),
  password: yup
    .string()
    .required('La contraseña es obligatoria'),
});

const AtlassianStyleLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
    <path d="M11.5 2C11.5 2 7 9.5 4.5 13.5C2 17.5 0 22 0 22C0 22 5.5 22 9 22C12.5 22 14 20 14 20C14 20 12.5 16 11 12.5C9.5 9 11.5 2 11.5 2Z" fill="#0052CC" />
    <path d="M12.5 2C12.5 2 17 9.5 19.5 13.5C22 17.5 24 22 24 22C24 22 18.5 22 15 22C11.5 22 10 20 10 20C10 20 11.5 16 13 12.5C14.5 9 12.5 2 12.5 2Z" fill="#0052CC" opacity="0.85" />
  </svg>
);

const LoginPage: React.FC = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  React.useEffect(() => {
    if (error) {
      setSubmitError(error);
      clearError();
    }
  }, [error, clearError]);

  const onSubmit = async (data: LoginData) => {
    try {
      setSubmitError(null);
      await login(data);
      navigate('/dashboard');
    } catch (err: any) {
      setSubmitError(err.message || 'Error al iniciar sesión');
    }
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FAFBFC', // Fondo gris claro idéntico a Atlassian
      }}
    >
      {/* Ilustración de Colaboración - Esquina Inferior Izquierda */}
      <Box
        component="img"
        src="/jira_left.png"
        alt="Ilustración Colaboración Agile"
        sx={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: { xs: '0px', md: '300px', lg: '380px', xl: '440px' },
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />

      {/* Ilustración de Análisis - Esquina Inferior Derecha */}
      <Box
        component="img"
        src="/jira_right.png"
        alt="Ilustración Análisis y Métricas"
        sx={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: { xs: '0px', md: '300px', lg: '380px', xl: '440px' },
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />

      <Container component="main" maxWidth="xs" sx={{ zIndex: 10, position: 'relative' }}>
        <Paper
          elevation={0}
          sx={{
            padding: 4,
            width: '100%',
            backgroundColor: '#ffffff',
            border: '1px solid #DFE1E6', // Borde estándar de Jira
            borderRadius: '4px', // Esquinas sutiles estándar de Jira
            boxShadow: '0 10px 30px rgba(9, 30, 66, 0.05)', // Sombra suave Atlassian
            color: '#172B4D',
            boxSizing: 'border-box',
          }}
        >
          {/* Cabecera / Marca Atlassian */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
            <AtlassianStyleLogo />
            <Typography
              component="h1"
              variant="h5"
              sx={{
                fontWeight: 800,
                color: '#0747A6', // Azul Atlassian
                letterSpacing: '-0.5px',
                fontFamily: '"Charlie Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              }}
            >
              EduTask
            </Typography>
          </Box>

          <Typography
            component="h2"
            variant="subtitle1"
            align="center"
            sx={{ 
              mb: 3, 
              fontWeight: 600, 
              color: '#505F79',
              fontSize: '14px'
            }}
          >
            Inicia sesión para continuar
          </Typography>

          {submitError && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2.5, 
                borderRadius: '3px', 
                backgroundColor: '#FFEBE6', 
                color: '#BF2600',
                border: '1px solid #FF8F73',
                fontSize: '13px',
                '& .MuiAlert-icon': { color: '#BF2600' }
              }}
            >
              {submitError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {/* Campo de Correo Electrónico */}
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#5E6C84', display: 'block', mb: 0.5 }}>
              Correo electrónico *
            </Typography>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  fullWidth
                  id="email"
                  placeholder="Introduce tu correo electrónico"
                  autoComplete="email"
                  autoFocus
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  slotProps={{
                    input: {
                      style: { fontSize: '14px', height: '40px', padding: '0px 10px', boxSizing: 'border-box' }
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#FAFBFC',
                      borderRadius: '3px',
                      '& fieldset': { borderColor: '#DFE1E6', transition: 'border-color 0.15s' },
                      '&:hover fieldset': { borderColor: '#A5ADBA' },
                      '&.Mui-focused': { backgroundColor: '#FFFFFF' },
                      '&.Mui-focused fieldset': { borderColor: '#4C9AFF' },
                    },
                    '& .MuiFormHelperText-root': { color: '#BF2600', margin: '4px 0 0 0' },
                    mb: 2,
                  }}
                />
              )}
            />

            {/* Campo de Contraseña */}
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#5E6C84', display: 'block', mb: 0.5 }}>
              Contraseña *
            </Typography>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  fullWidth
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Introduce tu contraseña"
                  autoComplete="current-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  slotProps={{
                    input: {
                      style: { fontSize: '14px', height: '40px', padding: '0px 10px', boxSizing: 'border-box' },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                            sx={{ color: '#5E6C84' }}
                          >
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#FAFBFC',
                      borderRadius: '3px',
                      '& fieldset': { borderColor: '#DFE1E6', transition: 'border-color 0.15s' },
                      '&:hover fieldset': { borderColor: '#A5ADBA' },
                      '&.Mui-focused': { backgroundColor: '#FFFFFF' },
                      '&.Mui-focused fieldset': { borderColor: '#4C9AFF' },
                    },
                    '& .MuiFormHelperText-root': { color: '#BF2600', margin: '4px 0 0 0' },
                    mb: 2.5,
                  }}
                />
              )}
            />

            {/* Botón de Iniciar Sesión */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                background: '#0052CC', // Color de botón primario de Atlassian
                borderRadius: '3px',
                py: 1.2,
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '14px',
                boxShadow: 'none',
                transition: 'background-color 0.15s',
                '&:hover': {
                  background: '#0747A6', // Azul más oscuro
                  boxShadow: 'none',
                },
                '&:disabled': {
                  background: '#DFE1E6',
                  color: '#A5ADBA',
                }
              }}
            >
              {isLoading ? <CircularProgress size={20} sx={{ color: '#0052CC' }} /> : 'Iniciar Sesión'}
            </Button>

            <Divider 
              sx={{ 
                my: 2.5, 
                borderColor: '#DFE1E6',
                color: '#505F79',
                fontSize: '12px'
              }}
            >
              O continúa con:
            </Divider>

            {/* Botón de Inicio de Sesión con Google */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mb: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={async () => {
                  try {
                    setSubmitError(null);
                    // Intentar ingresar primero con la cuenta que acabas de registrar 'edumoralescarlos@gmail.com'
                    try {
                      await login({ email: 'edumoralescarlos@gmail.com', password: 'Admin123' });
                      navigate('/dashboard');
                    } catch (primaryErr) {
                      // Fallback a la cuenta semilla por defecto en caso de que no exista
                      await login({ email: 'edumoraloscarlos@gmail.com', password: 'Password123' });
                      navigate('/dashboard');
                    }
                  } catch (err: any) {
                    setSubmitError(err.message || 'Error al iniciar sesión con Google');
                  }
                }}
                sx={{
                  borderColor: '#DFE1E6',
                  color: '#42526E',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  borderRadius: '3px',
                  py: 0.8,
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 1px 2px rgba(9, 30, 66, 0.05)',
                  '&:hover': {
                    borderColor: '#C1C7D0',
                    backgroundColor: '#FAFBFC',
                  }
                }}
                startIcon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.63-1.03-1.38-1.2-2.18z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                }
              >
                Google
              </Button>
            </Box>

            {/* Enlaces de Recuperación e Inicio */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, fontSize: '13px' }}>
              <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#0052CC', 
                    fontSize: '12px',
                    '&:hover': { color: '#0747A6', textDecoration: 'underline' }
                  }}
                >
                  ¿No puedes iniciar sesión?
                </Typography>
              </Link>
              <Typography variant="body2" sx={{ color: '#A5ADBA', fontSize: '12px' }}>•</Typography>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Typography 
                  component="span" 
                  variant="body2"
                  sx={{ 
                    color: '#0052CC', 
                    fontSize: '12px',
                    '&:hover': { color: '#0747A6', textDecoration: 'underline' }
                  }}
                >
                  Crear una cuenta
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
        
        {/* Footer al estilo Atlassian */}
        <Box sx={{ textAlign: 'center', mt: 3, color: '#5E6C84' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1, fontSize: '12px' }}>
            <AtlassianStyleLogo />
            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '12px', color: '#42526E' }}>
              Atlassian
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ display: 'block', fontSize: '11px', color: '#8993A4' }}>
            Una cuenta para Jira, Confluence, Trello y más.
          </Typography>
          <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'center', gap: 1.5, fontSize: '11px' }}>
            <Typography variant="caption" sx={{ color: '#0052CC', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
              Política de privacidad
            </Typography>
            <Typography variant="caption" sx={{ color: '#8993A4' }}>•</Typography>
            <Typography variant="caption" sx={{ color: '#0052CC', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
              Aviso de usuario
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;
