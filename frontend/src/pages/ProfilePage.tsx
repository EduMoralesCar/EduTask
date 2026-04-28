import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Avatar, 
  Grid, 
  TextField, 
  Button,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { Save, PhotoCamera } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    avatar: user?.avatar || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiService.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        avatar: formData.avatar
      });

      if (response.success && response.data) {
        // Asumiendo que el backend retorna el usuario en response.data o response.data.user
        const updatedUser = response.data;
        updateUser(updatedUser);
        setSuccess('Perfil actualizado exitosamente');
        setIsEditing(false);
      } else {
        setError(response.message || 'Error al actualizar el perfil');
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al guardar los cambios');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Mi Perfil
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

        <Paper sx={{ p: 4, mt: 3 }}>
          <Grid container spacing={4} sx={{ alignItems: 'flex-start' }}>
            <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar 
                sx={{ width: 150, height: 150, fontSize: '4rem', mb: 2, boxShadow: 3 }}
                src={isEditing ? formData.avatar : user?.avatar}
              >
                {user?.firstName?.charAt(0).toUpperCase()}
              </Avatar>
              
              {!isEditing && (
                <Button 
                  variant="outlined" 
                  startIcon={<PhotoCamera />}
                  onClick={() => setIsEditing(true)}
                  sx={{ mt: 1 }}
                >
                  Editar Perfil
                </Button>
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              {!isEditing ? (
                <Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {user?.fullName || `${user?.firstName} ${user?.lastName}`}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 2 }}>
                    <Typography color="text.secondary" sx={{ fontWeight: 'bold' }}>Correo:</Typography>
                    <Typography>{user?.email}</Typography>

                    <Typography color="text.secondary" sx={{ fontWeight: 'bold' }}>Usuario:</Typography>
                    <Typography>{user?.username}</Typography>

                    <Typography color="text.secondary" sx={{ fontWeight: 'bold' }}>Estado:</Typography>
                    <Typography color={user?.isEmailVerified ? "success.main" : "warning.main"}>
                      {user?.isEmailVerified ? "Verificado" : "Pendiente de verificación"}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Nombre"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Apellido"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="raised-button-file"
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData(prev => ({ ...prev, avatar: reader.result as string }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label htmlFor="raised-button-file">
                        <Button variant="outlined" component="span" startIcon={<PhotoCamera />} fullWidth>
                          Seleccionar Imagen desde mi PC
                        </Button>
                      </label>
                      {formData.avatar && formData.avatar.length > 200 && (
                        <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                          ✓ Imagen cargada exitosamente. Lista para guardar.
                        </Typography>
                      )}
                    </Grid>
                    <Grid size={{ xs: 12 }} sx={{ mt: 2, display: 'flex', gap: 2 }}>
                      <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary"
                        disabled={isLoading}
                        startIcon={isLoading ? <CircularProgress size={20} /> : <Save />}
                      >
                        Guardar Cambios
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="inherit"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            firstName: user?.firstName || '',
                            lastName: user?.lastName || '',
                            avatar: user?.avatar || ''
                          });
                        }}
                        disabled={isLoading}
                      >
                        Cancelar
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProfilePage;
