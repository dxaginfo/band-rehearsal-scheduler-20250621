import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Tooltip,
  Button,
  useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import { useDeleteAvailabilityMutation, useUpdateAvailabilityMutation } from '../../features/availability/availabilityApiSlice';
import AvailabilityTimeSlotDialog from './AvailabilityTimeSlotDialog';
import { formatTime, formatDate } from '../../utils/dateUtils';
import ConfirmDialog from '../ui/ConfirmDialog';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function AvailabilityList({ availabilityData, onAvailabilityChanged, isPersonal = true }) {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [editingSlot, setEditingSlot] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);

  const [deleteAvailability, { isLoading: isDeleting }] = useDeleteAvailabilityMutation();
  const [updateAvailability, { isLoading: isUpdating }] = useUpdateAvailabilityMutation();

  const handleEditSlot = (slot) => {
    setEditingSlot(slot);
    setSelectedDay(slot.dayOfWeek);
    setOpenDialog(true);
  };

  const handleConfirmDelete = (slot) => {
    setSlotToDelete(slot);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteSlot = async () => {
    try {
      await deleteAvailability(slotToDelete.id).unwrap();
      setDeleteConfirmOpen(false);
      onAvailabilityChanged();
    } catch (err) {
      console.error('Failed to delete availability:', err);
    }
  };
  
  const handleSave = async (data) => {
    try {
      // Update the existing availability slot
      await updateAvailability({
        id: editingSlot.id,
        ...data,
        isRecurring: editingSlot.isRecurring,
        dayOfWeek: editingSlot.dayOfWeek,
        specificDate: editingSlot.specificDate,
        isException: editingSlot.isException
      }).unwrap();
      
      setOpenDialog(false);
      onAvailabilityChanged();
    } catch (err) {
      console.error('Failed to update availability:', err);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {isPersonal ? 'My Availability List' : 'Band Member Availability'}
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        {isPersonal 
          ? 'All your availability settings, including regular weekly times and exceptions.'
          : 'View all band members\' availability settings to coordinate rehearsals.'}
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              {!isPersonal && (
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Member</TableCell>
              )}
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Day/Date</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Time</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Notes</TableCell>
              {isPersonal && (
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {availabilityData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isPersonal ? 5 : 6} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No availability settings found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              availabilityData.map((slot) => (
                <TableRow key={slot.id} hover>
                  {!isPersonal && (
                    <TableCell>
                      {slot.User ? `${slot.User.firstName} ${slot.User.lastName}` : 'Unknown'}
                    </TableCell>
                  )}
                  <TableCell>
                    <Chip
                      icon={
                        slot.isRecurring ? (
                          <EventRepeatIcon fontSize="small" />
                        ) : slot.isException ? (
                          <DoNotDisturbIcon fontSize="small" />
                        ) : (
                          <EventIcon fontSize="small" />
                        )
                      }
                      label={
                        slot.isRecurring
                          ? 'Weekly'
                          : slot.isException
                          ? 'Exception'
                          : 'Specific Date'
                      }
                      color={
                        slot.isRecurring
                          ? 'primary'
                          : slot.isException
                          ? 'error'
                          : 'secondary'
                      }
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {slot.isRecurring
                      ? dayNames[slot.dayOfWeek]
                      : formatDate(slot.specificDate)}
                  </TableCell>
                  <TableCell>
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </TableCell>
                  <TableCell>{slot.notes || '-'}</TableCell>
                  {isPersonal && (
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEditSlot(slot)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleConfirmDelete(slot)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AvailabilityTimeSlotDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleSave}
        initialData={editingSlot}
        dayName={selectedDay !== null ? dayNames[selectedDay] : ''}
        isLoading={isUpdating}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Availability"
        content="Are you sure you want to delete this availability time slot? This action cannot be undone."
        onConfirm={handleDeleteSlot}
        onCancel={() => setDeleteConfirmOpen(false)}
        isLoading={isDeleting}
      />
    </Box>
  );
}

export default AvailabilityList;