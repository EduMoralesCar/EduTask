import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Chip,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import { Close, Assignment, BugReport, Bookmark, Update, Send } from '@mui/icons-material';
import { Task, User } from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface TaskDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  taskId: string | null;
  onTaskUpdated: () => void;
}

const TaskDetailsDialog: React.FC<TaskDetailsDialogProps> = ({ open, onClose, taskId, onTaskUpdated }) => {
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  // Editable fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Task['status']>('todo');
  const [type, setType] = useState<Task['type']>('task');
  const [priority, setPriority] = useState<Task['priority']>('medium');

  useEffect(() => {
    if (open && taskId) {
      loadTaskDetails();
    } else {
      setTask(null);
      setEditMode(false);
    }
  }, [open, taskId]);

  const loadTaskDetails = async () => {
    try {
      setLoading(true);
      const res = await apiService.getTask(taskId!);
      if (res.success && res.data) {
        const t = res.data;
        setTask(t);
        setTitle(t.title);
        setDescription(t.description || '');
        setStatus(t.status);
        setType(t.type);
        setPriority(t.priority);
      }
    } catch (err) {
      console.error('Error loading task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!task) return;
    try {
      setSaving(true);
      const res = await apiService.updateTask(task.id, {
        title,
        description,
        status,
        type,
        priority
      });
      if (res.success) {
        setEditMode(false);
        loadTaskDetails();
        onTaskUpdated();
      }
    } catch (err) {
      console.error('Error saving task:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: Task['status']) => {
    if (!task) return;
    setStatus(newStatus);
    if (!editMode) {
      try {
        const res = await apiService.updateTask(task.id, { status: newStatus });
        if (res.success) {
          loadTaskDetails();
          onTaskUpdated();
        }
      } catch (err) {
        console.error('Error updating status:', err);
      }
    }
  };

  const handleAddComment = async () => {
    if (!task || !commentText.trim()) return;
    try {
      const res = await apiService.addComment(task.id, commentText);
      if (res.success) {
        setCommentText('');
        loadTaskDetails();
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleAssignToMe = async () => {
    if (!task || !user) return;
    try {
      const res = await apiService.updateTask(task.id, { assignee: user.id });
      if (res.success) {
        loadTaskDetails();
        onTaskUpdated();
      }
    } catch (err) {
      console.error('Error assigning task:', err);
    }
  };

  if (!open) return null;

  const getTypeIcon = (t: string) => {
    switch (t) {
      case 'bug': return <BugReport color="error" />;
      case 'story': return <Bookmark color="success" />;
      default: return <Assignment color="primary" />;
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'highest': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      case 'lowest': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'todo': return 'default';
      case 'in-progress': return 'primary';
      case 'in-review': return 'warning';
      case 'done': return 'success';
      case 'blocked': return 'error';
      default: return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {task ? getTypeIcon(task.type) : <Assignment />}
          <Typography variant="h6" component="span">
            {task ? task.key : 'Cargando tarea...'}
          </Typography>
        </Box>
        <IconButton aria-label="close" onClick={onClose} sx={{ color: 'grey.500' }}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', minHeight: 200 }}>
            <CircularProgress />
          </Box>
        ) : task ? (
          <>
            {/* Main Content Area (Left) */}
            <Box sx={{ flex: 2 }}>
              {editMode ? (
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Título"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  sx={{ mb: 2 }}
                />
              ) : (
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                  {task.title}
                </Typography>
              )}

              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Descripción
              </Typography>
              
              {editMode ? (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  placeholder="Añade una descripción más detallada..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  sx={{ mb: 3 }}
                />
              ) : (
                <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#f8fafc', minHeight: 100 }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {task.description || 'No hay descripción proporcionada.'}
                  </Typography>
                </Paper>
              )}

              {/* Activity / Comments Section */}
              <Typography variant="h6" sx={{ mb: 2 }}>
                Actividad
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>ME</Avatar>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Añadir un comentario..."
                  variant="outlined"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <IconButton color="primary" onClick={handleAddComment} disabled={!commentText.trim()}>
                          <Send fontSize="small" />
                        </IconButton>
                      )
                    }
                  }}
                />
              </Box>
              
              {/* Fake comments display since API model might not populate them yet */}
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                El historial de actividad se mostrará aquí.
              </Typography>
            </Box>

            {/* Sidebar (Right) */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={status}
                  label="Estado"
                  onChange={(e) => handleStatusChange(e.target.value as Task['status'])}
                  sx={{ 
                    bgcolor: getStatusColor(status) === 'default' ? 'grey.100' : `${getStatusColor(status)}.light`,
                    '& .MuiSelect-select': { fontWeight: 'bold' } 
                  }}
                >
                  <MenuItem value="todo">Por Hacer</MenuItem>
                  <MenuItem value="in-progress">En Progreso</MenuItem>
                  <MenuItem value="in-review">En Revisión</MenuItem>
                  <MenuItem value="done">Completado</MenuItem>
                  <MenuItem value="blocked">Bloqueado</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Detalles
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Asignado a</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24 }} src={task.assignee?.avatar}>
                        {task.assignee?.firstName?.charAt(0) || '?'}
                      </Avatar>
                      <Typography variant="body2">{task.assignee?.firstName || 'Sin asignar'}</Typography>
                    </Box>
                  </Box>
                  {task.assignee?.id !== user?.id && (
                    <Button size="small" variant="text" onClick={handleAssignToMe} sx={{ alignSelf: 'flex-end', textTransform: 'none' }}>
                      Asignarme a mí
                    </Button>
                  )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Reportador</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24 }} src={task.reporter?.avatar}>
                      {task.reporter?.firstName?.charAt(0) || '?'}
                    </Avatar>
                    <Typography variant="body2">{task.reporter?.firstName || '?'}</Typography>
                  </Box>
                </Box>

                {editMode ? (
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Prioridad</InputLabel>
                    <Select
                      value={priority}
                      label="Prioridad"
                      onChange={(e) => setPriority(e.target.value as Task['priority'])}
                    >
                      <MenuItem value="highest">Muy Alta</MenuItem>
                      <MenuItem value="high">Alta</MenuItem>
                      <MenuItem value="medium">Media</MenuItem>
                      <MenuItem value="low">Baja</MenuItem>
                      <MenuItem value="lowest">Muy Baja</MenuItem>
                    </Select>
                  </FormControl>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Prioridad</Typography>
                    <Chip size="small" label={task.priority} color={getPriorityColor(task.priority) as any} />
                  </Box>
                )}

                {editMode ? (
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      value={type}
                      label="Tipo"
                      onChange={(e) => setType(e.target.value as Task['type'])}
                    >
                      <MenuItem value="task">Tarea</MenuItem>
                      <MenuItem value="story">Historia</MenuItem>
                      <MenuItem value="bug">Bug</MenuItem>
                      <MenuItem value="epic">Épica</MenuItem>
                    </Select>
                  </FormControl>
                ) : null}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Typography variant="caption" color="text.secondary">Creado</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Actualizado</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(task.updatedAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </>
        ) : (
          <Typography color="error">No se pudo cargar la tarea.</Typography>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        {!editMode && task ? (
          <Button variant="outlined" onClick={() => setEditMode(true)}>
            Editar Detalles
          </Button>
        ) : editMode ? (
          <>
            <Button onClick={() => {
              setEditMode(false);
              setTitle(task?.title || '');
              setDescription(task?.description || '');
            }}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </>
        ) : null}
      </DialogActions>
    </Dialog>
  );
};

export default TaskDetailsDialog;
