import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import bandsReducer from './slices/bandsSlice';
import rehearsalsReducer from './slices/rehearsalsSlice';
import notificationsReducer from './slices/notificationsSlice';
import availabilityReducer from './slices/availabilitySlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    bands: bandsReducer,
    rehearsals: rehearsalsReducer,
    notifications: notificationsReducer,
    availability: availabilityReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;