import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Button,
  IconButton,
  Tooltip,
  useTheme,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useSetAvailabilityMutation, useDeleteAvailabilityMutation } from '../../features/availability/availabilityApiSlice';
import AvailabilityTimeSlotDialog from './AvailabilityTimeSlotDialog';
import { formatTime } from '../../utils/dateUtils';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function WeeklyAvailability({ bandId, availabilityData, onAvailabilityChanged }) {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [editingSlot, setEditingSlot] = useState(null);

  const [setAvailability, { isLoading: isAdding }] = useSetAvailabilityMutation();
  const [deleteAvailability, { isLoading: isDeleting }] = useDeleteAvailabilityMutation();

  // Group availabilities by day of week
  const availabilityByDay = dayNames.map((name, index) => {
    return {
      dayName: name,
      dayIndex: index,
      timeSlots: availabilityData.filter(slot => 
        slot.isRecurring && slot.dayOfWeek === index
      ).sort((a, b) => a.startTime.localeCompare(b.startTime))
    };
  });

  const handleAddSlot = (day) => {
    setSelectedDay(day);
    setEditingSlot(null);
    setOpenDialog(true);
  };

  const handleEditSlot = (slot) => {
    setEditingSlot(slot);
    setSelectedDay(slot.dayOfWeek);
    setOpenDialog(true);
  };

  const handleDeleteSlot = async (slotId) => {
    try {
      await deleteAvailability(slotId).unwrap();
      onAvailabilityChanged();
    } catch (err) {
      console.error('Failed to delete availability:', err);
    }
  };

  const handleSaveSlot = async (data) => {
    try {
      const payload = {
        ...data,
        bandId,
        isRecurring: true,
        dayOfWeek: selectedDay,
      };

      if (editingSlot) {
        // For editing, include the ID
        payload.id = editingSlot.id;
      }

      await setAvailability(payload).unwrap();
      setOpenDialog(false);
      onAvailabilityChanged();
    } catch (err) {
      console.error('Failed to save availability:', err);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Set Your Weekly Availability
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Add times when you're regularly available for rehearsals each week.
      </Typography>

      <Grid container spacing={2}>
        {availabilityByDay.map((day) => (
          <Grid item xs={12} md={6} key={day.dayIndex}>
            <Paper 
              elevation={1} 
              sx={{ 
                p: 2, 
                height: '100%',
                borderLeft: `4px solid ${theme.palette.primary.main}`,
                bgcolor: day.dayIndex === new Date().getDay() ? 
                  theme.palette.action.hover : 'background.paper',
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {day.dayName}
                </Typography>
                <Tooltip title={`Add availability for ${day.dayName}`}>
                  <IconButton 
                    size="small" 
                    color="primary" 
                    onClick={() => handleAddSlot(day.dayIndex)}
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {day.timeSlots.length === 0 ? (
                <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                  No availability set
                </Typography>
              ) : (
                day.timeSlots.map((slot) => (
                  <Box 
                    key={slot.id} 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1,
                      mb: 1,
                      borderRadius: 1,
                      bgcolor: theme.palette.background.default,
                    }}
                  >
                    <Typography variant="body2">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </Typography>
                    <Box>
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditSlot(slot)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleDeleteSlot(slot.id)}
                          disabled={isDeleting}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                ))
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      <AvailabilityTimeSlotDialog 
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleSaveSlot}
        initialData={editingSlot}
        dayName={selectedDay !== null ? dayNames[selectedDay] : ''}
        isLoading={isAdding}
      />
    </Box>
  );
}

export default WeeklyAvailability;