import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Fab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  ListItemButton
} from '@mui/material';
import {
  Add,
  MoreVert,
  Assignment,
  People,
  TrendingUp,
  Schedule,
  Visibility,
  Edit,
  Delete,
  CheckCircle,
  RadioButtonUnchecked
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { Project, Task, CreateProjectData } from '../types';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState<CreateProjectData>({
    name: '',
    key: '',
    description: '',
    type: 'scrum',
  });
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [projectsRes, tasksRes] = await Promise.all([
        apiService.getProjects(),
        apiService.getMyTasks()
      ]);
      
      if (projectsRes.success && projectsRes.data) {
        setProjects(projectsRes.data);
      }
      if (tasksRes.success && tasksRes.data) {
        setMyTasks(tasksRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      setCreateLoading(true);
      
      const response = await apiService.createProject(newProject);
      
      if (response.success && response.data) {
        loadData();
        setCreateDialogOpen(false);
        setNewProject({ name: '', key: '', description: '', type: 'scrum' });
        navigate(`/project/${response.data.id}`);
      } else {
        setError(response.message || 'Error al crear proyecto');
      }
    } catch (err: any) {
      setError(err.message || 'Error al crear proyecto');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, project: Project) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProject(null);
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    const confirmation = window.confirm(
      `¿Estás seguro de que quieres eliminar el proyecto "${selectedProject.name}"? Esta acción no se puede deshacer.`
    );

    if (confirmation) {
      try {
        const response = await apiService.deleteProject(selectedProject.id, selectedProject.name);
        
        if (response.success) {
          loadData();
        } else {
          setError(response.message || 'Error al eliminar proyecto');
        }
      } catch (err: any) {
        setError(err.message || 'Error al eliminar proyecto');
      }
    }
    
    handleMenuClose();
  };

  const getProjectTypeColor = (type: string) => {
    switch (type) {
      case 'scrum': return 'primary';
      case 'kanban': return 'secondary';
      case 'waterfall': return 'info';
      default: return 'default';
    }
  };

  const getCompletionPercentage = (project: Project) => {
    if (project.statistics.totalTasks === 0) return 0;
    return Math.round((project.statistics.completedTasks / project.statistics.totalTasks) * 100);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Bienvenido, {user?.firstName}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona tus proyectos y tareas de manera eficiente con EduTask
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Estadísticas */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assignment color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6">Proyectos</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {projects.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <People color="secondary" sx={{ mr: 2 }} />
                <Typography variant="h6">Miembros</Typography>
              </Box>
              <Typography variant="h4" color="secondary">
                {projects.reduce((total, project) => total + project.memberCount, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp color="success" sx={{ mr: 2 }} />
                <Typography variant="h6">Tareas Total</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {projects.reduce((total, project) => total + project.statistics.totalTasks, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Schedule color="warning" sx={{ mr: 2 }} />
                <Typography variant="h6">Completadas</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {projects.reduce((total, project) => total + project.statistics.completedTasks, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2">
              Mis Proyectos
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Nuevo Proyecto
            </Button>
          </Box>

          {projects.length === 0 ? (
            <Card sx={{ textAlign: 'center', py: 8 }}>
              <CardContent>
                <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No tienes proyectos aún
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Crea tu primer proyecto para comenzar a gestionar tus tareas
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  Crear Proyecto
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {projects.map((project) => (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={project.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" component="h3" gutterBottom>
                            {project.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Chip
                              label={project.key}
                              size="small"
                              color={getProjectTypeColor(project.type) as any}
                            />
                            <Chip
                              label={project.type}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, project)}
                        >
                          <MoreVert />
                        </IconButton>
                      </Box>

                      {project.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {project.description}
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <People sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {project.memberCount} miembros
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Progreso
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {getCompletionPercentage(project)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={getCompletionPercentage(project)}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => navigate(`/project/${project.id}`)}
                        >
                          Ver
                        </Button>
                        <Button
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => navigate(`/project/${project.id}/edit`)}
                        >
                          Editar
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        {/* Mis Tareas */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2">
              Mis Tareas Pendientes
            </Typography>
          </Box>

          <Card>
            {myTasks.filter(t => t.status !== 'done').length === 0 ? (
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography variant="body1">¡Todo al día!</Typography>
                <Typography variant="body2" color="text.secondary">No tienes tareas pendientes.</Typography>
              </CardContent>
            ) : (
              <List>
                {myTasks.filter(t => t.status !== 'done').slice(0, 5).map((task, index) => (
                  <React.Fragment key={task.id}>
                    {index > 0 && <Divider />}
                    <ListItemButton 
                      onClick={() => navigate(`/project/${task.project}`)}
                      sx={{ py: 2 }}
                    >
                      <ListItemIcon>
                        <RadioButtonUnchecked color={task.priority === 'highest' || task.priority === 'high' ? 'error' : 'action'} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={task.title} 
                        secondary={`${task.key} • ${new Date(task.createdAt).toLocaleDateString()}`}
                        slotProps={{ primary: { sx: { fontWeight: 'medium' } } }}
                      />
                    </ListItemButton>
                  </React.Fragment>
                ))}
              </List>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Diálogo de Crear Proyecto */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre del Proyecto"
            fullWidth
            variant="outlined"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Clave del Proyecto"
            fullWidth
            variant="outlined"
            value={newProject.key}
            onChange={(e) => setNewProject({ ...newProject, key: e.target.value.toUpperCase() })}
            placeholder="Ej: PROJ"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Descripción"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Tipo de Proyecto</InputLabel>
            <Select
              value={newProject.type}
              label="Tipo de Proyecto"
              onChange={(e) => setNewProject({ ...newProject, type: e.target.value as any })}
            >
              <MenuItem value="scrum">Scrum</MenuItem>
              <MenuItem value="kanban">Kanban</MenuItem>
              <MenuItem value="waterfall">Waterfall</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleCreateProject}
            variant="contained"
            disabled={!newProject.name || !newProject.key || createLoading}
          >
            {createLoading ? 'Creando...' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menú de Opciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedProject) navigate(`/project/${selectedProject.id}`);
          handleMenuClose();
        }}>
          <Visibility sx={{ mr: 2 }} />
          Ver Proyecto
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedProject) navigate(`/project/${selectedProject.id}/edit`);
          handleMenuClose();
        }}>
          <Edit sx={{ mr: 2 }} />
          Editar Proyecto
        </MenuItem>
        <MenuItem onClick={handleDeleteProject} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 2 }} />
          Eliminar Proyecto
        </MenuItem>
      </Menu>

      {/* Botón Flotante */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' }
        }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <Add />
      </Fab>
    </Container>
  );
};

export default DashboardPage;
