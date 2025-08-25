import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { API_URLS } from '../config/api';

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
      const res = await fetch(API_URLS.CREATE_CHECKOUT_SESSION, {
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
    <div className="card">
      <button className="btn-back" onClick={() => window.history.back()}>&larr;</button>
      <h2 className="title">Pagamento</h2>
      <p>Para acessar a análise completa do seu contrato, é necessário realizar o pagamento.</p>
      
      <div className="payment-info">
        <h3>O que você receberá:</h3>
        <ul>
          <li>✅ Análise completa das cláusulas</li>
          <li>✅ Explicação detalhada dos riscos</li>
          <li>✅ Recomendações personalizadas</li>
          <li>✅ Resumo executivo</li>
          <li>✅ Download em PDF</li>
        </ul>
      </div>

      <button 
        className="btn-primary" 
        onClick={handlePay} 
        disabled={loadingStripe}
        style={{ 
          fontSize: '1.1em', 
          padding: '12px 24px',
          background: '#10b981'
        }}
      >
        {loadingStripe ? 'Processando...' : 'Pagar e Ver Análise'}
      </button>
      
      <p style={{ fontSize: '0.9em', color: '#666', marginTop: '16px' }}>
        Pagamento seguro via Stripe
      </p>
    </div>
  );
};

export default PaymentStep; 