import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setAnalyses, setLoading, setError, ContractAnalysis } from '../store/analysesSlice';
import { useNavigate } from 'react-router-dom';

const AnalysesHistoryScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { analyses, loading, error } = useSelector((state: RootState) => state.analyses);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Load analyses from localStorage
    const loadAnalyses = () => {
      dispatch(setLoading(true));
      try {
        const savedAnalyses = localStorage.getItem('contractAnalyses');
        if (savedAnalyses) {
          dispatch(setAnalyses(JSON.parse(savedAnalyses)));
        }
      } catch (err) {
        dispatch(setError('Erro ao carregar análises.'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadAnalyses();
  }, [dispatch, isAuthenticated, navigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleViewAnalysis = (analysis: ContractAnalysis) => {
    // Store the selected analysis in localStorage for viewing
    localStorage.setItem('currentAnalysis', JSON.stringify(analysis));
    navigate('/');
  };

  if (loading) {
    return (
      <div className="card">
        <h2 className="title">Minhas Análises</h2>
        <p>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <h2 className="title">Minhas Análises</h2>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ 
      maxWidth: 600,
      margin: '0 auto',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '90%'
    }}>
      <button className="btn-back" onClick={() => navigate('/')}>&larr;</button>
      <h2 className="title">Minhas Análises</h2>
      
      {analyses.length === 0 ? (
        <p>Nenhuma análise encontrada.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {analyses.map((analysis) => (
            <div
              key={analysis.id}
              style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
              }}
              onClick={() => handleViewAnalysis(analysis)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#1e293b' }}>
                  Análise de {formatDate(analysis.date)}
                </h3>
                <span style={{ color: '#64748b', fontSize: '14px' }}>
                  {analysis.resumoRiscos.length} riscos encontrados
                </span>
              </div>
              <div style={{ color: '#64748b', fontSize: '14px' }}>
                {analysis.resumoRiscos.slice(0, 2).map((risco, index: number) => (
                  <div key={index} style={{ marginBottom: '4px' }}>
                    • {risco.titulo}
                  </div>
                ))}
                {analysis.resumoRiscos.length > 2 && (
                  <div style={{ color: '#6366f1', marginTop: '4px' }}>
                    +{analysis.resumoRiscos.length - 2} mais riscos...
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalysesHistoryScreen; 