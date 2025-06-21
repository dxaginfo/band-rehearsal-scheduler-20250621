import React from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

function AdminOnlyMessage({ message = 'This section is only available to band administrators.' }) {
  return (
    <Paper sx={{ p: 3, textAlign: 'center' }}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        py={3}
      >
        <LockIcon color="action" fontSize="large" sx={{ mb: 2, opacity: 0.6 }} />
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Admin Access Required
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          {message}
        </Typography>
        <Alert severity="info" sx={{ mt: 2, maxWidth: 450 }}>
          Contact the band owner or an administrator for access to this feature.
        </Alert>
      </Box>
    </Paper>
  );
}

export default AdminOnlyMessage;