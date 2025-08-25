import { configureStore } from '@reduxjs/toolkit';
import stepsReducer from './stepsSlice';
import clausulasReducer from './clausulasSlice';
import authReducer from './authSlice';
import analysesReducer from './analysesSlice';

export interface StepsState {
  currentStep: number;
  steps: {
    id: number;
    title: string;
    description: string;
    completed: boolean;
  }[];
}

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    email: string;
  } | null;
  loading: boolean;
  error: string | null;
}

export const store = configureStore({
  reducer: {
    steps: stepsReducer,
    clausulas: clausulasReducer,
    auth: authReducer,
    analyses: analysesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 