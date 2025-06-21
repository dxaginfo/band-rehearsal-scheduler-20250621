import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  useTheme,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useFindOptimalTimesQuery, useGetBandAvailabilityQuery } from '../../features/availability/availabilityApiSlice';
import { useGetBandMembersQuery } from '../../features/bands/bandsApiSlice';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function OptimalTimesFinder({ bandId }) {
  const theme = useTheme();
  const [duration, setDuration] = useState(120);
  const [requiredMembers, setRequiredMembers] = useState([]);
  
  const { 
    data: members,
    isLoading: isMembersLoading,
  } = useGetBandMembersQuery(bandId);
  
  const {
    data: optimalTimes,
    isFetching: isOptimalTimesLoading,
    isError: isOptimalTimesError,
    error: optimalTimesError,
    refetch: refetchOptimalTimes
  } = useFindOptimalTimesQuery({ 
    bandId, 
    duration, 
    requiredMembers 
  }, {
    refetchOnMountOrArgChange: true
  });
  
  const handleDurationChange = (e) => {
    setDuration(parseInt(e.target.value, 10));
  };
  
  const handleRequiredMembersChange = (e) => {
    setRequiredMembers(e.target.value);
  };
  
  const handleFindTimes = () => {
    refetchOptimalTimes();
  };

  if (isMembersLoading) {
    return <LoadingSpinner />;
  }

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Find Optimal Rehearsal Times
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Use band members' availability to identify the best times for rehearsals.
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Rehearsal Duration (minutes)"
              type="number"
              fullWidth
              value={duration}
              onChange={handleDurationChange}
              InputProps={{ inputProps: { min: 30, max: 480, step: 15 } }}
              helperText="How long do you need for a typical rehearsal?"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="required-members-label">Required Members</InputLabel>
              <Select
                labelId="required-members-label"
                multiple
                value={requiredMembers}
                onChange={handleRequiredMembersChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((memberId) => {
                      const member = members?.find(m => m.id === memberId);
                      return (
                        <Chip 
                          key={memberId} 
                          label={member ? `${member.firstName} ${member.lastName}` : 'Member'} 
                          size="small" 
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {members?.map((member) => (
                  <MenuItem key={member.id} value={member.id}>
                    {`${member.firstName} ${member.lastName}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleFindTimes}
              disabled={isOptimalTimesLoading}
              startIcon={isOptimalTimesLoading ? <CircularProgress size={24} /> : <EventAvailableIcon />}
              fullWidth
            >
              Find Optimal Times
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {isOptimalTimesError ? (
        <ErrorAlert error={optimalTimesError} />
      ) : (
        optimalTimes && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Results
            </Typography>
            
            <Grid container spacing={2}>
              {optimalTimes.data.recommendation.map((day, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card 
                    raised={index === 0}
                    sx={{
                      height: '100%',
                      borderTop: `4px solid ${
                        index === 0 
                          ? theme.palette.success.main
                          : index === 1
                          ? theme.palette.info.main
                          : theme.palette.warning.main
                      }`,
                    }}
                  >
                    <CardHeader
                      title={`${dayNames[day.day]} (${Math.round(day.availabilityPercentage)}% Available)`}
                      subheader={index === 0 ? 'Best Option' : `Option ${index + 1}`}
                      avatar={
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: index === 0 
                              ? theme.palette.success.main
                              : index === 1
                              ? theme.palette.info.main
                              : theme.palette.warning.main,
                            color: 'white',
                          }}
                        >
                          {dayLabels[day.day]}
                        </Box>
                      }
                    />
                    <Divider />
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <GroupIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body1">
                          {day.membersAvailable} of {day.totalMembers} members available
                        </Typography>
                      </Box>
                      
                      {day.bestTimes && day.bestTimes.length > 0 ? (
                        <List dense disablePadding>
                          {day.bestTimes.map((time, i) => (
                            <ListItem key={i} disablePadding sx={{ py: 0.5 }}>
                              <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              <ListItemText 
                                primary={`${time.start} - ${time.end}`} 
                                secondary={`${time.availableCount} members`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          More specific time recommendations will appear when members add availability.
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            <Alert severity="info" sx={{ mt: 3 }}>
              These recommendations are based on your band members' current availability settings. 
              For best results, ensure all members have updated their availability.
            </Alert>
          </Box>
        )
      )}
    </Box>
  );
}

export default OptimalTimesFinder;