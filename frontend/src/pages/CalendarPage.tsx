import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, CircularProgress, Alert } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { apiService } from '../services/api';
import { Task } from '../types';
import { useNavigate } from 'react-router-dom';

const CalendarPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getMyTasks();
      if (response.success && response.data) {
        setTasks(response.data);
      } else {
        setError(response.message || 'Error al cargar tareas');
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar tareas');
    } finally {
      setIsLoading(false);
    }
  };

  const getEventColor = (priority: string) => {
    switch (priority) {
      case 'highest': return '#d32f2f'; // Error main
      case 'high': return '#ed6c02'; // Warning main
      case 'medium': return '#0288d1'; // Info main
      case 'low': return '#2e7d32'; // Success main
      case 'lowest': return '#757575'; // Grey
      default: return '#1976d2'; // Primary main
    }
  };

  const events = tasks
    .filter(task => task.dueDate) // Solo mostrar tareas con fecha de vencimiento
    .map(task => ({
      id: task.id,
      title: `[${task.fullKey}] ${task.title}`,
      date: task.dueDate?.split('T')[0], // Solo la fecha YYYY-MM-DD
      backgroundColor: getEventColor(task.priority),
      borderColor: getEventColor(task.priority),
      extendedProps: {
        task
      }
    }));

  const handleEventClick = (info: any) => {
    const task = info.event.extendedProps.task;
    // Si tienes una vista de tarea, puedes navegar a ella, o al proyecto
    if (task.project?.id) {
      navigate(`/project/${task.project.id}`);
    }
  };

  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Calendario de Tareas
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Paper sx={{ p: 4, mt: 3, height: '70vh' }}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale="es"
            events={events}
            eventClick={handleEventClick}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek'
            }}
            buttonText={{
              today: 'Hoy',
              month: 'Mes',
              week: 'Semana'
            }}
            height="100%"
          />
        </Paper>
      </Box>
    </Container>
  );
};

export default CalendarPage;
