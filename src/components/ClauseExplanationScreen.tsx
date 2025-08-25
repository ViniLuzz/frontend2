import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { setClausulas, setLoading, setError } from '../store/clausulasSlice';
import { prevStep } from '../store/stepsSlice';
import { API_URLS } from '../config/api';

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

const ClausulaCard = ({ titulo, resumo, detalhes, risco }: { titulo: string; resumo: string; detalhes?: string; risco?: string }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="clausula-card" style={{ 
      marginBottom: 16, 
      padding: 16, 
      borderRadius: 12, 
      background: '#fef3c7', 
      border: '1px solid #f59e0b',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: 8
      }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: 16, 
          fontWeight: 600, 
          color: '#92400e' 
        }}>
          {titulo}
        </h3>
        {risco && (
          <span style={{ 
            background: '#ef4444', 
            color: 'white', 
            padding: '2px 8px', 
            borderRadius: 12, 
            fontSize: 11,
            fontWeight: 500
          }}>
            {risco}
          </span>
        )}
      </div>
      
      <p style={{ 
        margin: '8px 0', 
        fontSize: 14, 
        color: '#92400e',
        lineHeight: 1.4
      }}>
        {resumo}
      </p>
      
      {detalhes && (
        <>
          <button 
            onClick={() => setShowDetails(!showDetails)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#92400e', 
              textDecoration: 'underline', 
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500
            }}
          >
            {showDetails ? 'Ver menos detalhes' : 'Ver mais detalhes'}
          </button>
          
          {showDetails && (
            <div style={{ 
              marginTop: 12, 
              padding: 12, 
              background: '#fde68a', 
              borderRadius: 8, 
              color: '#92400e',
              fontSize: 13,
              lineHeight: 1.5
            }}>
              {detalhes}
            </div>
          )}
        </>
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
      fetch(`${API_URLS.ANALISE_POR_TOKEN}?token=${token}`)
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