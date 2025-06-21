import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { parseISO, format } from 'date-fns';

function AvailabilityTimeSlotDialog({ open, onClose, onSave, initialData, dayName, isLoading }) {
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      // Convert time strings (HH:MM:SS) to Date objects for TimePicker
      const timeToDate = (timeStr) => {
        try {
          if (!timeStr) return null;
          const [hours, minutes] = timeStr.split(':');
          const date = new Date();
          date.setHours(parseInt(hours, 10));
          date.setMinutes(parseInt(minutes, 10));
          date.setSeconds(0);
          return date;
        } catch (err) {
          console.error('Error parsing time:', err);
          return null;
        }
      };

      setStartTime(timeToDate(initialData.startTime));
      setEndTime(timeToDate(initialData.endTime));
      setNotes(initialData.notes || '');
    } else {
      resetForm();
    }
  }, [initialData, open]);

  const resetForm = () => {
    setStartTime(null);
    setEndTime(null);
    setNotes('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = () => {
    // Validate inputs
    if (!startTime || !endTime) {
      setError('Start and end times are required');
      return;
    }

    // Check that end time is after start time
    if (startTime >= endTime) {
      setError('End time must be after start time');
      return;
    }

    // Format times for API
    const formatTimeForApi = (date) => {
      return format(date, 'HH:mm:ss');
    };

    onSave({
      startTime: formatTimeForApi(startTime),
      endTime: formatTimeForApi(endTime),
      notes,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {initialData ? 'Edit Availability' : 'Add Availability'} - {dayName}
      </DialogTitle>
      
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TimePicker
                label="Start Time"
                value={startTime}
                onChange={setStartTime}
                slotProps={{ 
                  textField: { 
                    fullWidth: true,
                    required: true,
                    error: !!error && !startTime
                  } 
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TimePicker
                label="End Time"
                value={endTime}
                onChange={setEndTime}
                slotProps={{ 
                  textField: { 
                    fullWidth: true,
                    required: true,
                    error: !!error && !endTime
                  } 
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                multiline
                rows={2}
                placeholder="Add any notes about this availability slot"
              />
            </Grid>
            
            {error && (
              <Grid item xs={12}>
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              </Grid>
            )}
          </Grid>
        </LocalizationProvider>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          color="primary" 
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={24} /> : null}
        >
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AvailabilityTimeSlotDialog;