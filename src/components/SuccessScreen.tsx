import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    fetch(`https://backend3-production-0b95.up.railway.app/api/analise-liberada?token=${token}`)
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
    <div className="card" style={{ 
      maxWidth: 400, 
      margin: '0 auto', 
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }}>
      <h2 className="title">Pagamento aprovado!</h2>
      {status === 'loading' && <p style={{ color: '#6366f1', fontWeight: 600, fontSize: 18, margin: '20px 0' }}>Verificando pagamento...</p>}
      {status === 'liberado' && <>
        <p style={{ color: '#22c55e', fontWeight: 600, fontSize: 18, margin: '20px 0' }}>Acesso liberado à análise contratual.</p>
        <button onClick={handleViewAnalysis} className="btn-primary" style={{ display: 'inline-block', marginTop: 16 }}>Ver análise</button>
      </>}
      {status === 'negado' && <p style={{ color: '#ef4444', fontWeight: 600, fontSize: 18, margin: '20px 0' }}>Pagamento não confirmado ainda. Aguarde alguns segundos e recarregue.</p>}
      {status === 'erro' && <p style={{ color: '#ef4444', fontWeight: 600, fontSize: 18, margin: '20px 0' }}>Erro ao verificar pagamento. Tente novamente.</p>}
    </div>
  );
};

export default SuccessScreen; 