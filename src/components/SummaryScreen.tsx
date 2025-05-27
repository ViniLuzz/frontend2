import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetSteps, prevStep } from '../store/stepsSlice';
import { RootState } from '../store';
import { setResumo, setLoadingResumo, setErrorResumo } from '../store/clausulasSlice';
import { addAnalysis } from '../store/analysesSlice';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { auth } from '../firebase';



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

const ClausulaResumoCard = ({ titulo, resumo }: { titulo: string; resumo: string }) => {
  const [open, setOpen] = useState(false);
  
  // Separate the title from the risk details
  const riscoIndex = resumo.indexOf('- Risco:');
  const resumoText = riscoIndex !== -1 ? resumo.slice(0, riscoIndex).trim() : '';
  const detalhesText = riscoIndex !== -1 ? resumo.slice(riscoIndex).trim() : resumo.trim();

  return (
    <div className="risk-clause" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span className="risk-title">{titulo}</span>
        {detalhesText && (
          <button 
            onClick={() => setOpen((v) => !v)} 
            style={{ 
              color: '#6366f1', 
              background: 'none', 
              border: 'none', 
              marginLeft: 8, 
              cursor: 'pointer', 
              fontWeight: 600 
            }}
          >
            {open ? '▲ menos detalhes' : '▼ mais detalhes'}
          </button>
        )}
      </div>
      {resumoText && (
        <div style={{ marginTop: 4 }}>{resumoText}</div>
      )}
      {open && detalhesText && (
        <div style={{ 
          marginTop: 8, 
          background: '#fde68a', 
          borderRadius: 8, 
          padding: 10, 
          color: '#92400e' 
        }}>
          {detalhesText}
        </div>
      )}
    </div>
  );
};

const SummaryScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { clausulas, resumoSeguras, resumoRiscos, recomendacoes, loadingResumo, errorResumo } = useSelector((state: RootState) => state.clausulas);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [pago, setPago] = useState(() => localStorage.getItem('pago') === 'true');
  const [showInviteModal, setShowInviteModal] = useState(false);

  const handlePay = () => {
    setPago(true);
    localStorage.setItem('pago', 'true');
  };

  const handleDownloadPDF = () => {
    if (!pago) {
      return;
    }

    // Gera e baixa o PDF
    const doc = new jsPDF();
    let y = 10;
    
    // Título
    doc.setFontSize(16);
    doc.text('Análise Contratual', 10, y);
    y += 8;

    // Cláusulas de Atenção
    doc.setFontSize(14);
    doc.text('Cláusulas de Atenção', 10, y);
    y += 8;
    doc.setFontSize(11);
    clausulas.split(/\n(?=\d+\.)/).forEach((cl: string) => {
      if (y > 270) { doc.addPage(); y = 10; }
      doc.text(cl.trim(), 10, y, { maxWidth: 190 });
      y += 8 + Math.floor(cl.length / 90) * 6;
    });
    y += 10;

    // Cláusulas Seguras
    doc.setFontSize(14);
    doc.text('Cláusulas Seguras', 10, y);
    y += 8;
    doc.setFontSize(11);
    resumoSeguras.forEach((c: {titulo: string, resumo: string}) => {
      if (y > 270) { doc.addPage(); y = 10; }
      doc.text(`${c.titulo}: ${c.resumo}`, 12, y, { maxWidth: 185 });
      y += 7 + Math.floor((c.titulo.length + c.resumo.length) / 90) * 6;
    });
    y += 7;

    // Cláusulas de Risco
    doc.setFontSize(14);
    doc.text('Cláusulas de Risco', 10, y);
    y += 8;
    doc.setFontSize(11);
    resumoRiscos.forEach((c: {titulo: string, resumo: string}) => {
      if (y > 270) { doc.addPage(); y = 10; }
      doc.text(`${c.titulo}: ${c.resumo}`, 12, y, { maxWidth: 185 });
      y += 7 + Math.floor((c.titulo.length + c.resumo.length) / 90) * 6;
    });
    y += 7;

    // Recomendações
    doc.setFontSize(14);
    doc.text('Recomendações', 10, y);
    y += 8;
    doc.setFontSize(11);
    doc.text(recomendacoes || 'Considere consultar um advogado para revisar o contrato.', 12, y, { maxWidth: 185 });

    // Salva o PDF
    doc.save('analise-contrato.pdf');

    // Mostra o modal de convite para criar conta
    if (!isAuthenticated) {
      setShowInviteModal(true);
    }
  };

  const handleAnalyzeAnother = () => {
    if (!isAuthenticated) {
      setShowInviteModal(true);
      return;
    }
    dispatch(resetSteps());
  };

  useEffect(() => {
    if (clausulas && resumoSeguras.length === 0 && resumoRiscos.length === 0 && !loadingResumo && !errorResumo) {
      dispatch(setLoadingResumo(true));
      fetch('https://backend-production-ce11b.up.railway.app/api/resumir-clausulas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clausulas }),
      })
        .then(res => res.json())
        .then(data => {
          dispatch(setResumo({
            seguras: data.seguras || [],
            riscos: data.riscos || [],
            recomendacoes: data.recomendacoes || '',
          }));

          // Save the analysis if user is authenticated
          if (isAuthenticated) {
            const uid = auth.currentUser?.uid;
            if (!uid) {
              alert('Erro: usuário não autenticado. Faça login novamente.');
              return;
            }
            const analysis = {
              id: uuidv4(),
              date: new Date().toISOString(),
              clausulas,
              resumoSeguras: data.seguras || [],
              resumoRiscos: data.riscos || [],
              recomendacoes: data.recomendacoes || '',
              uid,
            };
            dispatch(addAnalysis(analysis));
            // Save to localStorage
            const savedAnalyses = localStorage.getItem('contractAnalyses');
            const analyses = savedAnalyses ? JSON.parse(savedAnalyses) : [];
            analyses.unshift(analysis);
            localStorage.setItem('contractAnalyses', JSON.stringify(analyses));
            // Save to Firestore
            addDoc(collection(db, 'Análise de contratos'), analysis).catch((e) => {
              console.error('Erro ao salvar análise no Firestore:', e);
            });
          }
        })
        .catch(() => dispatch(setErrorResumo('Erro ao resumir cláusulas.')));
    }
  }, [clausulas, resumoSeguras.length, resumoRiscos.length, loadingResumo, errorResumo, dispatch, isAuthenticated]);

  return (
    <div className="card">
      <button className="btn-back" onClick={() => dispatch(prevStep())}>&larr;</button>
      <h2 className="title">Resumo final</h2>
      {!pago && <PaymentCard onPay={handlePay} />}
      {pago && <>
        <div className="summary-section safe">
          <div className="summary-icon">✔️</div>
          <div>
            <strong>Cláusulas seguras</strong>
            {loadingResumo ? <p>Carregando...</p> :
              (resumoSeguras.length > 0 ? resumoSeguras.map((c: {titulo: string, resumo: string}, i: number) => (
                <p key={i}><span className="risk-title">{c.titulo}</span> {c.resumo}</p>
              )) : <p>Nenhuma cláusula segura encontrada.</p>)}
          </div>
        </div>
        <div className="summary-section risk">
          <div className="summary-icon">⚠️</div>
          <div>
            <strong>Cláusulas de risco</strong>
            {loadingResumo ? <p>Carregando...</p> :
              (resumoRiscos.length > 0 ?
                resumoRiscos.map((c: {titulo: string, resumo: string}, i: number) => (
                  <ClausulaResumoCard key={i} titulo={c.titulo} resumo={c.resumo} />
                )) : <p>Nenhuma cláusula de risco encontrada.</p>)}
          </div>
        </div>
        {/* <div className="summary-section recommend">
          <strong>Recomendações</strong>
          <p>{recomendacoes || 'Considere consultar um advogado para revisar o contrato.'}</p>
        </div> */}
        {errorResumo && <div style={{ color: 'red', marginBottom: 8 }}>{errorResumo}</div>}
        <button className="btn-primary" onClick={handleAnalyzeAnother}>
          Analisar outro contrato
        </button>
        <button className="btn-primary" style={{ marginTop: 8, background: '#6366f1' }} onClick={handleDownloadPDF}>
          Baixar PDF
        </button>
      </>}

      {/* Modal de convite para criar conta */}
      {showInviteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Crie sua conta</h3>
            <p>Para continuar usando o Contrato Claro, crie sua conta gratuitamente.</p>
            <div className="modal-buttons">
              <button className="btn-primary" onClick={() => setShowInviteModal(false)}>
                Fechar
              </button>
              <button className="btn-primary" style={{ background: '#6366f1' }} onClick={() => navigate('/register')}>
                Criar conta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryScreen; 
