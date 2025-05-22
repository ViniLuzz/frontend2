import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { nextStep, prevStep} from '../store/stepsSlice';
import { RootState } from '../store';

// Função para remover asteriscos duplicados
function cleanText(text: string) {
  return text.replace(/\*\*/g, '');
}

// Função para separar as cláusulas por número e dividir resumo/detalhes
function parseClausulas(text: string) {
  if (!text) return [];
  // Divide por números seguidos de ponto e espaço (ex: 1. ... 2. ...)
  const parts = text.split(/\n\s*\d+\.\s/).filter(Boolean);
  const matches = text.match(/\d+\.\s/g) || [];
  return parts.map((part, i) => {
    const full = (matches[i] || "") + part.trim();
    // Tenta separar título do resto (primeira linha = título)
    const [titulo, ...rest] = full.split('\n');
    const resto = rest.join('\n');
    // Procura por "- **Risco**" ou "**Risco**" para separar resumo/detalhes
    const riscoIndex = resto.search(/-?\s*\*\*Risco\*\*/i);
    let resumo = '', detalhes = '';
    if (riscoIndex !== -1) {
      resumo = resto.slice(0, riscoIndex).trim();
      detalhes = resto.slice(riscoIndex).trim();
    } else {
      resumo = resto.trim();
      detalhes = '';
    }
    return {
      titulo: cleanText(titulo.trim()),
      resumo: cleanText(resumo),
      detalhes: cleanText(detalhes),
    };
  });
}

const PaymentCard = ({ onPay }: { onPay: () => void }) => (
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
      onClick={onPay}
    >
      Liberar análise por R$ 4,99
    </button>
    <div style={{ position: 'absolute', top: 12, right: 18, background: '#6366f1', color: '#fff', borderRadius: 8, fontSize: 11, padding: '2px 10px', fontWeight: 600 }}>
      MAIS VENDIDO
    </div>
  </div>
);

const ClausulaCard = ({ titulo, resumo, detalhes }: { titulo: string, resumo: string, detalhes: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="clausula-card" style={{ background: '#f5f3ff', borderRadius: 12, marginBottom: 16, boxShadow: '0 2px 8px #e0e7ff', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setOpen(!open)}>
        <div>
          <strong>{titulo}</strong>
          {resumo && <div style={{ marginTop: 4 }}>{resumo}</div>}
        </div>
        <button style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: 600, cursor: 'pointer' }}>
          {open ? '▲ menos detalhes' : '▼ mais detalhes'}
        </button>
      </div>
      {open && detalhes && (
        <div style={{ marginTop: 12, color: '#3730a3', background: '#ede9fe', borderRadius: 8, padding: 10, whiteSpace: 'pre-line' }}>{detalhes}</div>
      )}
    </div>
  );
};

const ClauseExplanationScreen = () => {
  const dispatch = useDispatch();
  const { clausulas, loading, error } = useSelector((state: RootState) => state.clausulas);
  const cards = parseClausulas(clausulas);
  const [pago, setPago] = useState(() => localStorage.getItem('pago') === 'true');
  const [loadingStripe, setLoadingStripe] = useState(false);

  const handlePay = async () => {
    setLoadingStripe(true);
    try {
      const res = await fetch('https://backend-production-ce11b.up.railway.app/api/create-checkout-session', { method: 'POST' });
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

  // Se a URL for /success, liberar acesso e salvar no localStorage
  React.useEffect(() => {
    // Se localStorage indicar pagamento, mas não está marcado no state, libera acesso
    if (localStorage.getItem('pago') === 'true' && !pago) {
      setPago(true);
    }
  }, [pago]);

  return (
    <div className="card" style={{ maxWidth: 400 }}>
      <button className="btn-back" onClick={() => dispatch(prevStep())}>&larr;</button>
      <h2 className="title">Cláusulas de Atenção</h2>
      {!pago && <PaymentCard onPay={handlePay} />}
      {loadingStripe && <p style={{ color: '#6366f1', textAlign: 'center' }}>Redirecionando para pagamento...</p>}
      {pago && <>
        <div>
          {loading && <p>Analisando contrato com IA...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {!loading && !error && cards.length > 0 && cards.map((c, i) => (
            <ClausulaCard key={i} {...c} />
          ))}
          {!loading && !error && cards.length === 0 && <p>Nenhuma cláusula encontrada.</p>}
        </div>
        <button className="btn-primary" onClick={() => dispatch(nextStep())} disabled={loading} style={{ marginTop: 16 }}>
          Me explique melhor
        </button>
      </>}
    </div>
  );
};

export default ClauseExplanationScreen; 