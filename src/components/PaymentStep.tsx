import { useState } from 'react';
import { useLocation } from 'react-router-dom';

const PaymentStep = () => {
  const [loadingStripe, setLoadingStripe] = useState(false);
  const location = useLocation();

  const handlePay = async () => {
    setLoadingStripe(true);
    try {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      if (!token) {
        alert('Token do contrato não encontrado. Faça o upload novamente.');
        setLoadingStripe(false);
        return;
      }
      const res = await fetch('https://backend3-production-0b95.up.railway.app/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      alert('Erro ao iniciar pagamento.');
    } finally {
      setLoadingStripe(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 400, margin: '0 auto', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
      <h2 className="title">Acesso Premium</h2>
      <div style={{
        background: '#ede9fe',
        borderRadius: 18,
        boxShadow: '0 2px 16px #c7d2fe',
        padding: 28,
        marginBottom: 28,
        maxWidth: 340,
        margin: '0 auto',
        border: '2px solid #6366f1',
        color: '#3730a3',
        textAlign: 'center',
        position: 'relative',
      }}>
        <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 6 }}>Acesso Premium</div>
        <div style={{ fontSize: 32, fontWeight: 700, color: '#6366f1', marginBottom: 2 }}>R$ 4,99</div>
        <div style={{ fontSize: 13, color: '#6366f1', marginBottom: 12 }}>Pagamento único por análise contratual</div>
        <div style={{ textAlign: 'left', margin: '0 auto 18px auto', maxWidth: 260 }}>
          <div style={{ marginBottom: 6 }}>✔️ Explicação simples cláusula por cláusula</div>
          <div style={{ marginBottom: 6 }}>✔️ Identificação de cláusulas abusivas</div>
          <div style={{ marginBottom: 6 }}>✔️ Resumo de riscos</div>
          <div style={{ marginBottom: 6 }}>✔️ Inclui PDF com marcações</div>
        </div>
        <button
          className="btn-primary"
          style={{ width: '100%', fontSize: 18, marginTop: 8, background: '#6366f1' }}
          onClick={handlePay}
          disabled={loadingStripe}
        >
          {loadingStripe ? 'Redirecionando...' : 'Liberar análise por R$ 4,99'}
        </button>
        <div style={{ position: 'absolute', top: 12, right: 18, background: '#6366f1', color: '#fff', borderRadius: 8, fontSize: 11, padding: '2px 10px', fontWeight: 600 }}>
          MAIS VENDIDO
        </div>
      </div>
    </div>
  );
};

export default PaymentStep; 