import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setLoading, setError, loginSuccess } from '../store/authSlice';
import type { RootState } from '../store';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const LoginScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpa o erro de validação quando o usuário começa a digitar
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    
    if (!formData.email) {
      errors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    }
    
    if (!formData.password) {
      errors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      errors.password = 'A senha deve ter pelo menos 6 caracteres';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      dispatch(loginSuccess({ email: userCredential.user.email || '' }));
      navigate('/'); // Redireciona para a página inicial após o login
    } catch (err: any) {
      dispatch(setError(err.message || 'Falha ao fazer login. Por favor, tente novamente.'));
    }
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f3ff',
        zIndex: 99999,
        padding: '8vw',
        boxSizing: 'border-box',
        overflow: 'auto',
      }}
    >
      <div className="card" style={{ maxWidth: 320 }}>
        <h2 className="title">Entre na sua conta</h2>
        <p className="subtitle">Acesse para continuar usando o Contrato Claro</p>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ marginBottom: 16 , marginRight:20  }}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="input-field"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: validationErrors.email ? '1px solid #ef4444' : '1px solid #e5e7eb',
                marginBottom: '4px'
              }}
            />
            {validationErrors.email && <p style={{ color: '#ef4444', fontSize: 14 }}>{validationErrors.email}</p>}
          </div>
          <div style={{ marginBottom: 16 , marginRight:20  }}>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Senha"
              className="input-field"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: validationErrors.password ? '1px solid #ef4444' : '1px solid #e5e7eb',
                marginBottom: '4px'
              }}
            />
            {validationErrors.password && <p style={{ color: '#ef4444', fontSize: 14 }}>{validationErrors.password}</p>}
          </div>
          {error && <p style={{ color: '#ef4444', fontSize: 14, marginBottom: 16 }}>{error}</p>}
          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginBottom: 12, marginRight:20  }}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <button className="btn-link" onClick={handleRegister}>
          Não tem uma conta? Registre-se
        </button>
      </div>
    </div>
  );
};

export default LoginScreen; 