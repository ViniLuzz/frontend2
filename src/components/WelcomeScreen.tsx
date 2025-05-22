import { useDispatch } from 'react-redux';
import { nextStep } from '../store/stepsSlice';

const WelcomeScreen = () => {
  const dispatch = useDispatch();
  return (
    <div className="card">
      <h2 className="title">Entenda qualquer contrato em linguagem simples</h2>
      <p className="subtitle">Envie um contrato e descubra se ele é seguro para você.</p>
      <button className="btn-primary" onClick={() => dispatch(nextStep())}>
        Enviar contrato
      </button>
      <button className="btn-link">Como funciona?</button>
    </div>
  );
};

export default WelcomeScreen; 