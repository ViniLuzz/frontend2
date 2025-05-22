import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ClausulaResumo {
  titulo: string;
  resumo: string;
}

export interface ClausulasState {
  clausulas: string;
  loading: boolean;
  error: string | null;
  resumoSeguras: ClausulaResumo[];
  resumoRiscos: ClausulaResumo[];
  recomendacoes: string;
  loadingResumo: boolean;
  errorResumo: string | null;
}

const getInitialClausulas = () => {
  return localStorage.getItem('clausulas') || '';
};

const initialState: ClausulasState = {
  clausulas: getInitialClausulas(),
  loading: false,
  error: null,
  resumoSeguras: [],
  resumoRiscos: [],
  recomendacoes: '',
  loadingResumo: false,
  errorResumo: null,
};

const clausulasSlice = createSlice({
  name: 'clausulas',
  initialState,
  reducers: {
    setClausulas: (state: ClausulasState, action: PayloadAction<string>) => {
      state.clausulas = action.payload;
      state.loading = false;
      state.error = null;
      localStorage.setItem('clausulas', action.payload);
    },
    setLoading: (state: ClausulasState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state: ClausulasState, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    resetClausulas: (state: ClausulasState) => {
      state.clausulas = '';
      state.loading = false;
      state.error = null;
      state.resumoSeguras = [];
      state.resumoRiscos = [];
      state.recomendacoes = '';
      state.loadingResumo = false;
      state.errorResumo = null;
      localStorage.removeItem('clausulas');
    },
    setResumo: (state: ClausulasState, action: PayloadAction<{seguras: ClausulaResumo[]; riscos: ClausulaResumo[]; recomendacoes: string;}>) => {
      state.resumoSeguras = action.payload.seguras;
      state.resumoRiscos = action.payload.riscos;
      state.recomendacoes = action.payload.recomendacoes;
      state.loadingResumo = false;
      state.errorResumo = null;
    },
    setLoadingResumo: (state: ClausulasState, action: PayloadAction<boolean>) => {
      state.loadingResumo = action.payload;
    },
    setErrorResumo: (state: ClausulasState, action: PayloadAction<string | null>) => {
      state.errorResumo = action.payload;
      state.loadingResumo = false;
    },
  },
});

export const { setClausulas, setLoading, setError, resetClausulas, setResumo, setLoadingResumo, setErrorResumo } = clausulasSlice.actions;
export default clausulasSlice.reducer;
