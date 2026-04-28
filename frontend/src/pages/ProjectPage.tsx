import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
  ListItemAvatar,
  Divider,
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
  PersonAdd,
  Comment,
  BugReport,
  Task as TaskIcon,
  Timeline,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import { Project, Task, CreateTaskData, AddMemberData } from '../types';
import TaskDetailsDialog from '../components/TaskDetailsDialog';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<CreateTaskData>({
    title: '',
    description: '',
    project: id || '',
    type: 'task',
    priority: 'medium',
  });
  const [newMember, setNewMember] = useState<AddMemberData>({
    email: '',
    role: 'member',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [addMemberLoading, setAddMemberLoading] = useState(false);

  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false);
  const [detailsTaskId, setDetailsTaskId] = useState<string | null>(null);

  const handleOpenTaskDetails = (taskId: string) => {
    setDetailsTaskId(taskId);
    setTaskDetailsOpen(true);
  };

  const handleCloseTaskDetails = () => {
    setTaskDetailsOpen(false);
    setDetailsTaskId(null);
  };

  const loadProject = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getProject(id!);
      
      if (response.success && response.data) {
        setProject(response.data);
      } else {
        setError(response.message || 'Error al cargar proyecto');
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar proyecto');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await apiService.getTasks(id!);
      
      if (response.success && response.data) {
        setTasks(response.data.docs || []);
      } else {
        setError(response.message || 'Error al cargar tareas');
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar tareas');
    }
  };

  useEffect(() => {
    if (id) {
      loadProject();
      loadTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCreateTask = async () => {
    try {
      setCreateLoading(true);
      
      const response = await apiService.createTask(newTask);
      
      if (response.success && response.data) {
        setCreateTaskDialogOpen(false);
        setNewTask({
          title: '',
          description: '',
          project: id!,
          type: 'task',
          priority: 'medium',
        });
        loadTasks();
      } else {
        setError(response.message || 'Error al crear tarea');
      }
    } catch (err: any) {
      setError(err.message || 'Error al crear tarea');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAddMember = async () => {
    try {
      setAddMemberLoading(true);
      
      const response = await apiService.addMember(id!, newMember);
      
      if (response.success) {
        setAddMemberDialogOpen(false);
        setNewMember({ email: '', role: 'member' });
        loadProject();
      } else {
        setError(response.message || 'Error al agregar miembro');
      }
    } catch (err: any) {
      setError(err.message || 'Error al agregar miembro');
    } finally {
      setAddMemberLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, task: Task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'story': return <Assignment />;
      case 'bug': return <BugReport />;
      case 'task': return <TaskIcon />;
      case 'epic': return <Timeline />;
      default: return <TaskIcon />;
    }
  };

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'story': return 'primary';
      case 'bug': return 'error';
      case 'task': return 'secondary';
      case 'epic': return 'info';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'highest': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      case 'lowest': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'success';
      case 'in-progress': return 'warning';
      case 'in-review': return 'info';
      case 'blocked': return 'error';
      case 'todo': return 'default';
      default: return 'default';
    }
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

  if (!project) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error">
          Proyecto no encontrado
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {project.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Chip label={project.key} size="small" color="primary" />
              <Chip label={project.type} size="small" variant="outlined" />
              <Chip label={`${project.memberCount} miembros`} size="small" variant="outlined" />
            </Box>
            {project.description && (
              <Typography variant="body1" color="text.secondary">
                {project.description}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<PersonAdd />}
              onClick={() => setAddMemberDialogOpen(true)}
            >
              Agregar Miembro
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateTaskDialogOpen(true)}
            >
              Nueva Tarea
            </Button>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Estadísticas del Proyecto */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assignment color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6">Tareas</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {project.statistics.totalTasks}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp color="success" sx={{ mr: 2 }} />
                <Typography variant="h6">Completadas</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {project.statistics.completedTasks}
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
                {project.memberCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Schedule color="warning" sx={{ mr: 2 }} />
                <Typography variant="h6">Sprints</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {project.statistics.activeSprints}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Tabs */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Tareas" />
              <Tab label="Miembros" />
              <Tab label="Actividad" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tarea</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Prioridad</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Asignado</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Box sx={{ py: 4 }}>
                          <Assignment sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="h6" gutterBottom>
                            No hay tareas aún
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => setCreateTaskDialogOpen(true)}
                          >
                            Crear Primera Tarea
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {task.fullKey} - {task.title}
                            </Typography>
                            {task.description && (
                              <Typography variant="caption" color="text.secondary">
                                {task.description.substring(0, 100)}...
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getTaskTypeIcon(task.type)}
                            <Chip label={task.type} size="small" color={getTaskTypeColor(task.type) as any} />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={task.priority} size="small" color={getPriorityColor(task.priority) as any} />
                        </TableCell>
                        <TableCell>
                          <Chip label={task.status} size="small" color={getStatusColor(task.status) as any} />
                        </TableCell>
                        <TableCell>
                          {task.assignee ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar src={task.assignee.avatar} sx={{ width: 24, height: 24 }}>
                                {task.assignee.fullName.charAt(0)}
                              </Avatar>
                              <Typography variant="body2">
                                {task.assignee.fullName}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Sin asignar
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, task)}
                          >
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <List>
              {project.members.map((member) => (
                <React.Fragment key={member.user.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar src={member.user.avatar}>
                        {member.user.fullName.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={member.user.fullName}
                      secondary={`${member.user.email} - ${member.role}`}
                    />
                    <Chip label={member.role} size="small" />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
              Actividad del proyecto próximamente...
            </Typography>
          </TabPanel>
        </Grid>
      </Grid>

      {/* Diálogo de Crear Tarea */}
      <Dialog open={createTaskDialogOpen} onClose={() => setCreateTaskDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Crear Nueva Tarea</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Título de la Tarea"
            fullWidth
            variant="outlined"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Descripción"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Tarea</InputLabel>
                <Select
                  value={newTask.type}
                  label="Tipo de Tarea"
                  onChange={(e) => setNewTask({ ...newTask, type: e.target.value as any })}
                >
                  <MenuItem value="task">Tarea</MenuItem>
                  <MenuItem value="story">Historia</MenuItem>
                  <MenuItem value="bug">Error</MenuItem>
                  <MenuItem value="epic">Épica</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Prioridad</InputLabel>
                <Select
                  value={newTask.priority}
                  label="Prioridad"
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                >
                  <MenuItem value="lowest">Muy Baja</MenuItem>
                  <MenuItem value="low">Baja</MenuItem>
                  <MenuItem value="medium">Media</MenuItem>
                  <MenuItem value="high">Alta</MenuItem>
                  <MenuItem value="highest">Muy Alta</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateTaskDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleCreateTask}
            variant="contained"
            disabled={!newTask.title || createLoading}
          >
            {createLoading ? 'Creando...' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Agregar Miembro */}
      <Dialog open={addMemberDialogOpen} onClose={() => setAddMemberDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Miembro al Proyecto</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Correo Electrónico"
            type="email"
            fullWidth
            variant="outlined"
            value={newMember.email}
            onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Rol</InputLabel>
            <Select
              value={newMember.role}
              label="Rol"
              onChange={(e) => setNewMember({ ...newMember, role: e.target.value as any })}
            >
              <MenuItem value="member">Miembro</MenuItem>
              <MenuItem value="developer">Desarrollador</MenuItem>
              <MenuItem value="tester">Tester</MenuItem>
              <MenuItem value="admin">Administrador</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddMemberDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleAddMember}
            variant="contained"
            disabled={!newMember.email || addMemberLoading}
          >
            {addMemberLoading ? 'Enviando...' : 'Enviar Invitación'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menú de Opciones de Tarea */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedTask) handleOpenTaskDetails(selectedTask.id);
          handleMenuClose();
        }}>
          <Visibility sx={{ mr: 2 }} />
          Ver / Editar Tarea
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
        onClick={() => setCreateTaskDialogOpen(true)}
      >
        <Add />
      </Fab>

      <TaskDetailsDialog
        open={taskDetailsOpen}
        onClose={handleCloseTaskDetails}
        taskId={detailsTaskId}
        onTaskUpdated={loadTasks}
      />
    </Container>
  );
};

export default ProjectPage;
