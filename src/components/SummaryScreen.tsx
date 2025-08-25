import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_URLS } from '../config/api';

const ClausulaResumoCard = ({ titulo, resumo, detalhes }: { titulo: string; resumo: string; detalhes?: string }) => {
  const [showDetails, setShowDetails] = useState(false);
  const detalhesText = detalhes || resumo;

  return (
    <div className="clausula-card" style={{ marginBottom: 12, padding: 12, borderRadius: 8, background: '#fef3c7', border: '1px solid #f59e0b' }}>
      <div style={{ fontWeight: 600, marginBottom: 4, color: '#92400e' }}>{titulo}</div>
      <div style={{ fontSize: 14, color: '#92400e' }}>{resumo}</div>
      {detalhes && (
        <button 
          onClick={() => setShowDetails(!showDetails)}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#92400e', 
            textDecoration: 'underline', 
            cursor: 'pointer',
            fontSize: 12,
            marginTop: 4
          }}
        >
          {showDetails ? 'Ver menos' : 'Ver mais'}
        </button>
      )}
      {showDetails && detalhes && (
        <div style={{ marginTop: 8, fontSize: 13, color: '#92400e' }}>{detalhesText}</div>
      )}
    </div>
  );
};

const SummaryScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [analise, setAnalise] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (!token) {
      setErro('Token não encontrado na URL.');
      setLoading(false);
      return;
    }
    
    fetch(`${API_URLS.ANALISE_POR_TOKEN}?token=${token}`)
      .then(res => {
        if (res.status === 403) {
          throw new Error('O pagamento ainda não foi confirmado. Tente novamente em instantes.');
        }
        return res.ok ? res.json() : Promise.reject();
      })
      .then(data => {
        if (data && data.analise) {
          setAnalise(data.analise);
        } else {
          setErro('Análise não encontrada para este token.');
        }
      })
      .catch((error) => setErro(error.message || 'Erro ao buscar análise.'))
      .finally(() => setLoading(false));
  }, [location.search]);

  const handleDownloadPDF = () => {
    if (!analise) return;
    
    // Aqui você pode implementar o download do PDF
    // Por enquanto, vamos apenas mostrar uma mensagem
    alert('Funcionalidade de download em desenvolvimento');
  };

  if (loading) {
    return (
      <div className="card">
        <h2 className="title">Resumo final</h2>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div className="loading-spinner"></div>
          <p>Carregando análise...</p>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="card">
        <h2 className="title">Erro</h2>
        <p style={{ color: '#ef4444' }}>{erro}</p>
        <button className="btn-primary" onClick={() => navigate('/upload')}>
          Voltar ao Início
        </button>
      </div>
    );
  }

  if (!analise) {
    return <div className="card"><h2 className="title">Resumo final</h2><p>Nenhuma análise encontrada.</p></div>;
  }
  
  const params = new URLSearchParams(location.search);
  const token = params.get('token');

  return (
    <div className="card">
      <button className="btn-back" onClick={() => token && navigate(`/clausulas?token=${token}`)}>&larr; Voltar</button>
      <h2 className="title">Resumo final</h2>
      <div className="summary-section safe">
        <div className="summary-icon">✔️</div>
        <div>
          <strong>Cláusulas seguras</strong>
          {(analise.resumoSeguras || []).length > 0 ? (analise.resumoSeguras.map((c: any, i: number) => (
            <p key={i}><span className="risk-title">{c.titulo}</span> {c.resumo}</p>
          ))) : <p>Nenhuma cláusula segura encontrada.</p>}
        </div>
      </div>
      <div className="summary-section risk">
        <div className="summary-icon">⚠️</div>
        <div>
          <strong>Cláusulas de risco</strong>
          {(analise.resumoRiscos || []).length > 0 ? (
            analise.resumoRiscos.map((c: any, i: number) => (
              <ClausulaResumoCard key={i} titulo={c.titulo} resumo={c.resumo} />
            ))
          ) : <p>Nenhuma cláusula de risco encontrada.</p>}
        </div>
      </div>
      <button className="btn-primary" style={{ marginTop: 8, background: '#6366f1' }} onClick={handleDownloadPDF}>
        Baixar PDF
      </button>
      <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => navigate('/upload')}>
        Analisar outro contrato
      </button>
    </div>
  );
};

export default SummaryScreen; 