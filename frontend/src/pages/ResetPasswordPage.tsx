import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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

const AtlassianStyleLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
    <path d="M11.5 2C11.5 2 7 9.5 4.5 13.5C2 17.5 0 22 0 22C0 22 5.5 22 9 22C12.5 22 14 20 14 20C14 20 12.5 16 11 12.5C9.5 9 11.5 2 11.5 2Z" fill="#0052CC" />
    <path d="M12.5 2C12.5 2 17 9.5 19.5 13.5C22 17.5 24 22 24 22C24 22 18.5 22 15 22C11.5 22 10 20 10 20C10 20 11.5 16 13 12.5C14.5 9 12.5 2 12.5 2Z" fill="#0052CC" opacity="0.85" />
  </svg>
);

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token?: string }>();
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
      code: token || '',
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
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        position: 'relative',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FAFBFC', // Fondo Atlassian
        py: 4,
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
          width: { xs: '0px', md: '260px', lg: '350px', xl: '400px' },
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
          width: { xs: '0px', md: '260px', lg: '350px', xl: '400px' },
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />

      <Container component="main" maxWidth="sm" sx={{ zIndex: 10, position: 'relative' }}>
        <Paper
          elevation={0}
          sx={{
            padding: 4,
            width: '100%',
            backgroundColor: '#ffffff',
            border: '1px solid #DFE1E6',
            borderRadius: '4px',
            boxShadow: '0 10px 30px rgba(9, 30, 66, 0.05)',
            color: '#172B4D',
            boxSizing: 'border-box',
          }}
        >
          {/* Cabecera / Marca Atlassian */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
            <AtlassianStyleLogo />
            <Typography
              component="h1"
              variant="h5"
              sx={{
                fontWeight: 800,
                color: '#0747A6',
                letterSpacing: '-0.5px',
                fontFamily: '"Charlie Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              }}
            >
              EduTask
            </Typography>
          </Box>

          {!isSuccess ? (
            <>
              <Typography 
                component="h2" 
                variant="subtitle1" 
                align="center"
                sx={{ 
                  mb: 1.5, 
                  fontWeight: 'bold', 
                  color: '#172B4D',
                  fontSize: '16px' 
                }}
              >
                Restablecer Contraseña
              </Typography>

              <Typography variant="body2" align="center" sx={{ color: '#5E6C84', mb: 3, fontSize: '13px' }}>
                Ingresa el código de 6 dígitos enviado a tu correo y elige tu nueva contraseña.
              </Typography>

              {error && (
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
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                {/* Código de Verificación */}
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#5E6C84', display: 'block', mb: 0.5 }}>
                  Código de 6 dígitos *
                </Typography>
                <Controller
                  name="code"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      required
                      fullWidth
                      id="code"
                      placeholder="XXXXXX"
                      error={!!errors.code}
                      helperText={errors.code?.message}
                      slotProps={{
                        htmlInput: { 
                          maxLength: 6, 
                          style: { 
                            letterSpacing: '8px', 
                            textAlign: 'center', 
                            fontSize: '18px', 
                            fontWeight: 'bold',
                            height: '40px',
                            padding: '0px 10px',
                            boxSizing: 'border-box'
                          } 
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#FAFBFC',
                          borderRadius: '3px',
                          '& fieldset': { borderColor: '#DFE1E6' },
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

                {/* Nueva Contraseña */}
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#5E6C84', display: 'block', mb: 0.5 }}>
                  Nueva contraseña *
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
                      placeholder="Elige una contraseña nueva"
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
                          '& fieldset': { borderColor: '#DFE1E6' },
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

                {/* Confirmar Nueva Contraseña */}
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#5E6C84', display: 'block', mb: 0.5 }}>
                  Confirmar contraseña *
                </Typography>
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      required
                      fullWidth
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      placeholder="Repite la contraseña nueva"
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message}
                      slotProps={{
                        input: {
                          style: { fontSize: '14px', height: '40px', padding: '0px 10px', boxSizing: 'border-box' },
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle confirm password visibility"
                                onClick={handleToggleConfirmPasswordVisibility}
                                edge="end"
                                sx={{ color: '#5E6C84' }}
                              >
                                {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#FAFBFC',
                          borderRadius: '3px',
                          '& fieldset': { borderColor: '#DFE1E6' },
                          '&:hover fieldset': { borderColor: '#A5ADBA' },
                          '&.Mui-focused': { backgroundColor: '#FFFFFF' },
                          '&.Mui-focused fieldset': { borderColor: '#4C9AFF' },
                        },
                        '& .MuiFormHelperText-root': { color: '#BF2600', margin: '4px 0 0 0' },
                        mb: 3,
                      }}
                    />
                  )}
                />

                {/* Botón de Cambiar Contraseña */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  sx={{
                    background: '#0052CC',
                    borderRadius: '3px',
                    py: 1.2,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: '14px',
                    boxShadow: 'none',
                    transition: 'background-color 0.15s',
                    '&:hover': {
                      background: '#0747A6',
                      boxShadow: 'none',
                    },
                    '&:disabled': {
                      background: '#DFE1E6',
                      color: '#A5ADBA',
                    }
                  }}
                >
                  {isLoading ? <CircularProgress size={20} sx={{ color: '#0052CC' }} /> : 'Restablecer Contraseña'}
                </Button>

                <Divider sx={{ my: 2.5, borderColor: '#DFE1E6' }} />

                <Box sx={{ textAlign: 'center' }}>
                  <Link to="/login" style={{ textDecoration: 'none' }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#0052CC', 
                        fontSize: '13px',
                        '&:hover': { color: '#0747A6', textDecoration: 'underline' }
                      }}
                    >
                      Volver a Iniciar Sesión
                    </Typography>
                  </Link>
                </Box>
              </Box>
            </>
          ) : (
            <>
              <Typography 
                component="h2" 
                variant="subtitle1" 
                align="center"
                sx={{ 
                  mb: 1.5, 
                  fontWeight: 'bold', 
                  color: '#172B4D',
                  fontSize: '18px' 
                }}
              >
                Contraseña Restablecida
              </Typography>

              <Typography variant="body1" align="center" sx={{ color: '#5E6C84', mb: 3, fontSize: '13px' }}>
                Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.
              </Typography>

              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3, 
                  borderRadius: '3px', 
                  backgroundColor: '#EAE6FF', 
                  color: '#403294',
                  border: '1px solid #C0B6F2',
                  fontSize: '13px',
                  '& .MuiAlert-icon': { color: '#403294' }
                }}
              >
                ¡Tu cuenta está segura ahora!
              </Alert>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={() => navigate('/login')}
                  sx={{
                    px: 6,
                    background: '#0052CC',
                    borderRadius: '3px',
                    py: 1.2,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: '14px',
                    boxShadow: 'none',
                    '&:hover': {
                      background: '#0747A6',
                      boxShadow: 'none',
                    }
                  }}
                >
                  Iniciar Sesión
                </Button>
              </Box>
            </>
          )}
        </Paper>
        
        {/* Footer al estilo Atlassian */}
        <Box sx={{ textAlign: 'center', mt: 3, color: '#5E6C84' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 1 }}>
            <AtlassianStyleLogo />
            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '12px', color: '#42526E' }}>
              Atlassian
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, fontSize: '11px' }}>
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

export default ResetPasswordPage;
