import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Switch, 
  FormControlLabel, 
  Divider, 
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import { Settings as SettingsIcon, Notifications, Palette, Language } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [preferences, setPreferences] = useState<{
    language: 'es' | 'en';
    theme: 'light' | 'dark';
    notifications: { email: boolean; push: boolean };
  }>({
    language: 'es',
    theme: 'light',
    notifications: {
      email: true,
      push: true
    }
  });

  useEffect(() => {
    if (user?.preferences) {
      setPreferences(user.preferences);
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');
      
      const response = await apiService.updateProfile({ preferences });
      
      if (response.success && response.data) {
        setSuccessMsg('Configuración guardada exitosamente');
        updateUser(response.data);
      } else {
        setErrorMsg(response.message || 'Error al guardar la configuración');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SettingsIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
          <Typography variant="h4">Configuración de la Cuenta</Typography>
        </Box>

        {successMsg && <Alert severity="success" sx={{ mb: 3 }}>{successMsg}</Alert>}
        {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}

        <Grid container spacing={3}>
          {/* Apariencia y Lenguaje */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Palette sx={{ mr: 1 }} color="primary" /> Apariencia
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Tema del Sistema</InputLabel>
                <Select
                  value={preferences.theme}
                  label="Tema del Sistema"
                  onChange={(e) => setPreferences({ ...preferences, theme: e.target.value as 'light' | 'dark' })}
                >
                  <MenuItem value="light">Claro</MenuItem>
                  <MenuItem value="dark">Oscuro</MenuItem>
                </Select>
              </FormControl>

              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 4 }}>
                <Language sx={{ mr: 1 }} color="primary" /> Idioma
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <FormControl fullWidth>
                <InputLabel>Idioma de la Plataforma</InputLabel>
                <Select
                  value={preferences.language}
                  label="Idioma de la Plataforma"
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value as 'es' | 'en' })}
                >
                  <MenuItem value="es">Español</MenuItem>
                  <MenuItem value="en">Inglés</MenuItem>
                </Select>
              </FormControl>
            </Paper>
          </Grid>

          {/* Notificaciones */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Notifications sx={{ mr: 1 }} color="primary" /> Notificaciones
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Notificaciones por Correo</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Recibe resúmenes diarios, asignaciones de tareas y menciones.
                </Typography>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={preferences.notifications.email}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        notifications: { ...preferences.notifications, email: e.target.checked }
                      })}
                      color="primary"
                    />
                  }
                  label="Activar notificaciones por correo"
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Notificaciones Push (Navegador)</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Recibe alertas instantáneas en tu navegador cuando algo importante ocurra.
                </Typography>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={preferences.notifications.push}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        notifications: { ...preferences.notifications, push: e.target.checked }
                      })}
                      color="primary"
                    />
                  }
                  label="Activar notificaciones en tiempo real"
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Guardar Configuración'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default SettingsPage;
