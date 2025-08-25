import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setClausulas, setLoading, setError } from '../store/clausulasSlice';
import { RootState } from '../store';
import { auth } from '../firebase';
import { API_URLS } from '../config/api';

const UploadScreen = () => {
  const dispatch = useDispatch();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleBoxClick = () => {
    inputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setUploading(true);
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const formData = new FormData();
      formData.append('file', file);
      // Extrai o token da URL
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (token) {
        formData.append('token', token);
      }
      // Adiciona o uid do usuário logado
      const uid = auth.currentUser?.uid;
      if (uid) {
        formData.append('uid', uid);
      }

      console.log('Iniciando upload do arquivo:', file.name);

      const response = await fetch(API_URLS.ANALISAR_CONTRATO, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('Resposta recebida:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro no servidor: ${response.status}`);
      }

      let data;
      try {
        data = await response.json();
      } catch {
        const text = await response.text();
        throw new Error(text || 'Resposta inválida do servidor');
      }
      console.log('Dados recebidos:', data);

      if (data.clausulas && data.token) {
        dispatch(setClausulas(data.clausulas));
        navigate(`/pagamento?token=${data.token}`);
      } else {
        throw new Error(data.error || 'Resposta inválida do servidor');
      }
    } catch (err) {
      console.error('Erro durante o upload:', err);
      dispatch(setError(err instanceof Error ? err.message : 'Erro ao conectar com o servidor.'));
    } finally {
      setUploading(false);
      dispatch(setLoading(false));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <div className="card">
      <button className="btn-back" onClick={() => window.history.back()}>&larr;</button>
      <h2 className="title">Upload do Contrato</h2>
      <p>Faça upload do seu contrato para análise</p>
      
      <div className="upload-box" onClick={handleBoxClick}>
        <input
          ref={inputRef}
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png,.txt"
          style={{ display: 'none' }}
        />
        {file ? (
          <div>
            <p>Arquivo selecionado: {file.name}</p>
            <button className="btn-primary" onClick={handleAnalyze} disabled={uploading}>
              {uploading ? 'Analisando...' : 'Analisar Contrato'}
            </button>
          </div>
        ) : (
          <div>
            <p>Clique para selecionar um arquivo</p>
            <p>Formatos aceitos: PDF, JPG, PNG, TXT</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadScreen; 