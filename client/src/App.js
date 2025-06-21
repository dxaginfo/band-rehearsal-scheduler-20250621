import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';

// Layout components
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Bands from './pages/Bands';
import BandDetail from './pages/BandDetail';
import RehearsalCalendar from './pages/RehearsalCalendar';
import CreateRehearsal from './pages/CreateRehearsal';
import RehearsalDetail from './pages/RehearsalDetail';
import UserProfile from './pages/UserProfile';
import NotFound from './pages/NotFound';

// Auth actions
import { checkAuthStatus } from './redux/slices/authSlice';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/bands" element={<Bands />} />
        <Route path="/bands/:id" element={<BandDetail />} />
        <Route path="/calendar" element={<RehearsalCalendar />} />
        <Route path="/rehearsals/new" element={<CreateRehearsal />} />
        <Route path="/rehearsals/:id" element={<RehearsalDetail />} />
        <Route path="/profile" element={<UserProfile />} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;