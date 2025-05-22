import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { goToStep } from '../store/stepsSlice';
// import { useNavigate } from 'react-router-dom';

const SuccessScreen = () => {
  const dispatch = useDispatch();
  // const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('pago', 'true');
  }, []);

  const handleViewAnalysis = () => {
    dispatch(goToStep(3)); // Vai para ClauseExplanationScreen
    // navigate('/'); // Não precisa mais navegar
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
      <p style={{ color: '#22c55e', fontWeight: 600, fontSize: 18, margin: '20px 0' }}>Acesso liberado à análise contratual.</p>
      <button onClick={handleViewAnalysis} className="btn-primary" style={{ display: 'inline-block', marginTop: 16 }}>Ver análise</button>
    </div>
  );
};

export default SuccessScreen; 