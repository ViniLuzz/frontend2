import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setLoading, setError, registerSuccess } from '../store/authSlice';
import { RootState } from '../store';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const RegisterScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [formData, setFormData] = useState({
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (formData.email !== formData.confirmEmail) {
      newErrors.confirmEmail = 'Emails não conferem';
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não conferem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      dispatch(setLoading(true));
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        dispatch(registerSuccess({ email: userCredential.user.email || '' }));
        navigate('/'); // Go back to home
      } catch (err: any) {
        dispatch(setError(err.message || 'Erro ao criar conta. Tente novamente.'));
      }
    }
  };

  const handleLogin = () => {
    navigate('/login');
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
        <h2 className="title">Criar conta</h2>
        <p className="subtitle">Preencha os dados para criar sua conta</p>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ marginBottom: 16, marginRight:20  }}>
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
                border: errors.email ? '1px solid #ef4444' : '1px solid #e5e7eb',
                marginBottom: '4px'
              }}
            />
            {errors.email && <p style={{ color: '#ef4444', fontSize: 14 }}>{errors.email}</p>}
          </div>

          <div style={{ marginBottom: 16, marginRight:20   }}>
            <input
              type="email"
              name="confirmEmail"
              value={formData.confirmEmail}
              onChange={handleChange}
              placeholder="Confirmar email"
              className="input-field"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: errors.confirmEmail ? '1px solid #ef4444' : '1px solid #e5e7eb',
                marginBottom: '4px'
              }}
            />
            {errors.confirmEmail && <p style={{ color: '#ef4444', fontSize: 14 }}>{errors.confirmEmail}</p>}
          </div>

          <div style={{ marginBottom: 16, marginRight:20 }}>
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
                border: errors.password ? '1px solid #ef4444' : '1px solid #e5e7eb',
                marginBottom: '4px'
              }}
            />
            {errors.password && <p style={{ color: '#ef4444', fontSize: 14 }}>{errors.password}</p>}
          </div>

          <div style={{ marginBottom: 16, marginRight:20  }}>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirmar senha"
              className="input-field"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: errors.confirmPassword ? '1px solid #ef4444' : '1px solid #e5e7eb',
                marginBottom: '4px'
              }}
            />
            {errors.confirmPassword && <p style={{ color: '#ef4444', fontSize: 14 }}>{errors.confirmPassword}</p>}
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: 14, marginBottom: 16 }}>{error}</p>}

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', marginBottom: 12, marginRight:20  }}
            disabled={loading}
          >
            {loading ? 'Criando conta...' : 'Registrar'}
          </button>
        </form>

        <button className="btn-link" onClick={handleLogin}>
          Já tenho uma conta
        </button>
      </div>
    </div>
  );
};

export default RegisterScreen; 