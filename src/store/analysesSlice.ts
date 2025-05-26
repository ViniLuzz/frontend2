import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ContractAnalysis {
  id: string;
  date: string;
  clausulas: string;
  resumoSeguras: { titulo: string; resumo: string }[];
  resumoRiscos: { titulo: string; resumo: string }[];
  recomendacoes: string;
}

interface AnalysesState {
  analyses: ContractAnalysis[];
  loading: boolean;
  error: string | null;
}

const initialState: AnalysesState = {
  analyses: [],
  loading: false,
  error: null,
};

const analysesSlice = createSlice({
  name: 'analyses',
  initialState,
  reducers: {
    addAnalysis: (state, action: PayloadAction<ContractAnalysis>) => {
      state.analyses.unshift(action.payload);
    },
    setAnalyses: (state, action: PayloadAction<ContractAnalysis[]>) => {
      state.analyses = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { addAnalysis, setAnalyses, setLoading, setError } = analysesSlice.actions;
export default analysesSlice.reducer; 
