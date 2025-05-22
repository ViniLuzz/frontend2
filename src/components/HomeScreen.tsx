import React from 'react';
import { useDispatch } from 'react-redux';
import { goToStep } from '../store/stepsSlice';

const HomeScreen: React.FC = () => {
  const dispatch = useDispatch();

  const handleAnalyzeContract = () => {
    dispatch(goToStep(2)); // step 2 = upload
  };

  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-gray-50 z-10">
      <div className="card" style={{ maxWidth: 340 }}>
        <h2 className="title">Análise de Contratos</h2>
        <p className="subtitle">Analise seus contratos de forma rápida e eficiente</p>
        <button
          onClick={handleAnalyzeContract}
          className="btn-primary"
          style={{ width: '100%' }}
        >
          Analisar Contrato
        </button>
      </div>
    </div>
  );
};

export default HomeScreen; 