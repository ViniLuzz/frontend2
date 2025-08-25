import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface StepsState {
  step: number;
}

const initialState: StepsState = {
  step: 1,
};

const stepsSlice = createSlice({
  name: 'steps',
  initialState,
  reducers: {
    goToStep: (state: StepsState, action: PayloadAction<number>) => {
      state.step = action.payload;
    },
    nextStep: (state: StepsState) => {
      state.step += 1;
    },
    prevStep: (state: StepsState) => {
      state.step = Math.max(1, state.step - 1);
    },
    resetSteps: (state: StepsState) => {
      state.step = 1;
    },
  },
});

export const { goToStep, nextStep, prevStep, resetSteps } = stepsSlice.actions;
export default stepsSlice.reducer;
