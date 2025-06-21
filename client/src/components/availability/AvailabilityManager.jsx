import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Tabs, 
  Tab, 
  Paper,
  Divider,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useGetUserAvailabilityQuery, useGetBandAvailabilityQuery } from '../../features/availability/availabilityApiSlice';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { useGetBandDetailsQuery } from '../../features/bands/bandsApiSlice';

import WeeklyAvailability from './WeeklyAvailability';
import AvailabilityList from './AvailabilityList';
import OptimalTimesFinder from './OptimalTimesFinder';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';
import AdminOnlyMessage from '../ui/AdminOnlyMessage';

function AvailabilityManager() {
  const { bandId } = useParams();
  const [tab, setTab] = useState(0);
  const currentUser = useSelector(selectCurrentUser);
  
  const { 
    data: userAvailability,
    isLoading: isUserAvailabilityLoading,
    isError: isUserAvailabilityError,
    error: userAvailabilityError,
    refetch: refetchUserAvailability
  } = useGetUserAvailabilityQuery(bandId);
  
  const {
    data: bandDetails,
    isLoading: isBandLoading,
  } = useGetBandDetailsQuery(bandId);
  
  // Only fetch band availability if user is admin
  const isAdmin = bandDetails?.owner.id === currentUser?.id || 
    bandDetails?.members.some(member => 
      member.id === currentUser?.id && member.BandMember.role === 'admin'
    );
  
  const { 
    data: bandAvailability,
    isLoading: isBandAvailabilityLoading,
    isError: isBandAvailabilityError,
    error: bandAvailabilityError,
    refetch: refetchBandAvailability
  } = useGetBandAvailabilityQuery(bandId, {
    skip: !isAdmin
  });

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  if (isBandLoading || isUserAvailabilityLoading) {
    return <LoadingSpinner />;
  }

  if (isUserAvailabilityError) {
    return <ErrorAlert error={userAvailabilityError} />;
  }

  return (
    <Container>
      <Box my={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          {bandDetails?.name} - Availability Settings
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Set your regular availability to help schedule rehearsals that work for everyone.
        </Typography>

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="My Weekly Schedule" />
            <Tab label="My Availability List" />
            {isAdmin && <Tab label="Band Availability" />}
            {isAdmin && <Tab label="Find Optimal Times" />}
          </Tabs>
          <Divider />

          <Box p={3}>
            {/* My Weekly Schedule */}
            {tab === 0 && (
              <WeeklyAvailability 
                bandId={bandId} 
                availabilityData={userAvailability?.data || []}
                onAvailabilityChanged={refetchUserAvailability}
              />
            )}

            {/* My Availability List */}
            {tab === 1 && (
              <AvailabilityList 
                availabilityData={userAvailability?.data || []}
                onAvailabilityChanged={refetchUserAvailability}
                isPersonal
              />
            )}

            {/* Band Availability (Admin Only) */}
            {tab === 2 && (
              isAdmin ? (
                <Box>
                  {isBandAvailabilityLoading ? (
                    <LoadingSpinner />
                  ) : isBandAvailabilityError ? (
                    <ErrorAlert error={bandAvailabilityError} />
                  ) : (
                    <AvailabilityList 
                      availabilityData={bandAvailability?.data || []}
                      onAvailabilityChanged={refetchBandAvailability}
                      isPersonal={false}
                    />
                  )}
                </Box>
              ) : (
                <AdminOnlyMessage />
              )
            )}

            {/* Find Optimal Times (Admin Only) */}
            {tab === 3 && (
              isAdmin ? (
                <OptimalTimesFinder bandId={bandId} />
              ) : (
                <AdminOnlyMessage />
              )
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default AvailabilityManager;