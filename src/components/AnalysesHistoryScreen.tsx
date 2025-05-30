import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setAnalyses, setLoading, setError, ContractAnalysis } from '../store/analysesSlice';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

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

    const loadAnalyses = async () => {
      dispatch(setLoading(true));
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error('Usuário não autenticado');
        const q = query(
          collection(db, 'análises de contratos'),
          where('uid', '==', uid),
          orderBy('date', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const userAnalyses: ContractAnalysis[] = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ContractAnalysis));
        dispatch(setAnalyses(userAnalyses));
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
    // Redireciona para a tela de cláusulas explicadas com o token
    navigate(`/clausulas?token=${analysis.id}`);
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
                borderRadius: '16px',
                padding: '20px 24px',
                border: '2px solid #22c55e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px #e0e7ff',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 18, color: '#1e293b', marginBottom: 4 }}>
                  {'Análise de contrato'}
                </div>
                <div style={{ fontWeight: 600, fontSize: 16, color: '#16a34a' }}>
                  DATA: {formatDate(analysis.date)}
                </div>
              </div>
              <button
                className="btn-primary"
                style={{ fontWeight: 700, fontSize: 16, background: '#a78bfa', color: '#fff', marginLeft: 16, minWidth: 120 }}
                onClick={() => handleViewAnalysis(analysis)}
              >
                VER ANÁLISE
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalysesHistoryScreen; 