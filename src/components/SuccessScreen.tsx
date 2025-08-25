import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URLS } from '../config/api';

const SuccessScreen = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'liberado' | 'negado' | 'erro'>('loading');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) {
      setStatus('erro');
      return;
    }
    
    fetch(`${API_URLS.ANALISE_LIBERADA}?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.liberado) {
          setStatus('liberado');
        } else {
          setStatus('negado');
        }
      })
      .catch(() => setStatus('erro'));
  }, []);

  const handleViewAnalysis = () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      navigate(`/clausulas?token=${token}`);
    }
  };

  return (
    <div className="card">
      <h2 className="title">Status do Pagamento</h2>
      
      {status === 'loading' && (
        <div className="status-loading">
          <div className="loading-spinner"></div>
          <p>Verificando status do pagamento...</p>
        </div>
      )}
      
      {status === 'liberado' && (
        <div className="status-success">
          <div className="success-icon">✅</div>
          <h3>Pagamento Confirmado!</h3>
          <p>Sua análise está liberada. Clique no botão abaixo para visualizar os resultados.</p>
          <button className="btn-primary" onClick={handleViewAnalysis}>
            Ver Análise Completa
          </button>
        </div>
      )}
      
      {status === 'negado' && (
        <div className="status-error">
          <div className="error-icon">❌</div>
          <h3>Pagamento Pendente</h3>
          <p>O pagamento ainda não foi confirmado. Aguarde alguns instantes e tente novamente.</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            Verificar Novamente
          </button>
        </div>
      )}
      
      {status === 'erro' && (
        <div className="status-error">
          <div className="error-icon">⚠️</div>
          <h3>Erro na Verificação</h3>
          <p>Ocorreu um erro ao verificar o status. Tente novamente ou entre em contato com o suporte.</p>
          <button className="btn-primary" onClick={() => navigate('/upload')}>
            Voltar ao Início
          </button>
        </div>
      )}
    </div>
  );
};

export default SuccessScreen; 