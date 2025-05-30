import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {prevStep} from '../store/stepsSlice';
import { RootState } from '../store';
import { useLocation, useNavigate } from 'react-router-dom';

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
  const location = useLocation();
  const navigate = useNavigate();

  // Buscar cláusulas do backend se não houver no Redux
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    // Removido: redirecionamento automático para o resumo final
    if (!clausulas && token) {
      fetch(`https://backend-production-ce11b.up.railway.app/api/analise-por-token?token=${token}`)
        .then(res => {
          if (res.status === 403) {
            throw new Error('O pagamento ainda não foi confirmado. Tente novamente em instantes.');
          }
          return res.ok ? res.json() : Promise.reject();
        })
        .then(data => {
          if (data && data.analise && data.analise.clausulas) {
            dispatch({ type: 'clausulas/setClausulas', payload: data.analise.clausulas });
          }
        })
        .catch(error => {
          console.error('Erro ao buscar análise:', error);
          dispatch({ type: 'clausulas/setError', payload: error.message || 'Erro ao buscar análise.' });
        });
    }
  }, [clausulas, location.search, dispatch]);

  return (
    <div className="card" style={{ maxWidth: 400 }}>
      <button className="btn-back" onClick={() => dispatch(prevStep())}>&larr;</button>
      <h2 className="title">Cláusulas de Atenção</h2>
      {/* Removido: {!pago && <PaymentCard onPay={handlePay} />} */}
      {/* Só mostra explicação se pago */}
      {clausulas && <>
        <div>
          {loading && <p>Analisando contrato com IA...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {!loading && !error && cards.length > 0 && cards.map((c, i) => (
            <ClausulaCard key={i} {...c} />
          ))}
          {!loading && !error && cards.length === 0 && <p>Nenhuma cláusula encontrada.</p>}
        </div>
        <button className="btn-primary" onClick={() => {
          const params = new URLSearchParams(location.search);
          const token = params.get('token');
          if (token) navigate(`/analise?token=${token}`);
        }} disabled={loading} style={{ marginTop: 16 }}>
          Me explique melhor
        </button>
      </>}
    </div>
  );
};

export default ClauseExplanationScreen; 