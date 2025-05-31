import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';

const ClausulaResumoCard = ({ titulo, resumo }: { titulo: string; resumo: string }) => {
  const [open, setOpen] = useState(false);
  const riscoIndex = resumo.indexOf('- Risco:');
  const resumoText = riscoIndex !== -1 ? resumo.slice(0, riscoIndex).trim() : '';
  const detalhesText = riscoIndex !== -1 ? resumo.slice(riscoIndex).trim() : resumo.trim();
  return (
    <div className="risk-clause" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span className="risk-title">{titulo}</span>
        {detalhesText && (
          <button onClick={() => setOpen((v) => !v)} style={{ color: '#6366f1', background: 'none', border: 'none', marginLeft: 8, cursor: 'pointer', fontWeight: 600 }}>
            {open ? '▲ menos detalhes' : '▼ mais detalhes'}
          </button>
        )}
      </div>
      {resumoText && <div style={{ marginTop: 4 }}>{resumoText}</div>}
      {open && detalhesText && (
        <div style={{ marginTop: 8, background: '#fde68a', borderRadius: 8, padding: 10, color: '#92400e' }}>{detalhesText}</div>
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
    fetch(`http://backend3.railway.internal/api/analise-por-token?token=${token}`)
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
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(16);
    doc.text('Análise Contratual', 10, y);
    y += 8;
    doc.setFontSize(14);
    doc.text('Cláusulas de Atenção', 10, y);
    y += 8;
    doc.setFontSize(11);
    (analise.clausulas || '').split(/\n(?=\d+\.)/).forEach((cl: string) => {
      if (y > 270) { doc.addPage(); y = 10; }
      doc.text(cl.trim(), 10, y, { maxWidth: 190 });
      y += 8 + Math.floor(cl.length / 90) * 6;
    });
    y += 10;
    doc.setFontSize(14);
    doc.text('Cláusulas Seguras', 10, y);
    y += 8;
    doc.setFontSize(11);
    (analise.resumoSeguras || []).forEach((c: {titulo: string, resumo: string}) => {
      if (y > 270) { doc.addPage(); y = 10; }
      doc.text(`${c.titulo}: ${c.resumo}`, 12, y, { maxWidth: 185 });
      y += 7 + Math.floor((c.titulo.length + c.resumo.length) / 90) * 6;
    });
    y += 7;
    doc.setFontSize(14);
    doc.text('Cláusulas de Risco', 10, y);
    y += 8;
    doc.setFontSize(11);
    (analise.resumoRiscos || []).forEach((c: {titulo: string, resumo: string}) => {
      if (y > 270) { doc.addPage(); y = 10; }
      doc.text(`${c.titulo}: ${c.resumo}`, 12, y, { maxWidth: 185 });
      y += 7 + Math.floor((c.titulo.length + c.resumo.length) / 90) * 6;
    });
    y += 7;
    doc.setFontSize(14);
    doc.text('Recomendações', 10, y);
    y += 8;
    doc.setFontSize(11);
    doc.text(analise.recomendacoes || 'Considere consultar um advogado para revisar o contrato.', 12, y, { maxWidth: 185 });
    doc.save('analise-contrato.pdf');
  };

  if (loading) {
    return <div className="card"><h2 className="title">Resumo final</h2><p>Carregando análise...</p></div>;
  }
  if (erro) {
    return <div className="card"><h2 className="title">Resumo final</h2><p style={{ color: 'red' }}>{erro}</p></div>;
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