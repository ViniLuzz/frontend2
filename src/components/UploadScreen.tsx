import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { prevStep } from '../store/stepsSlice';
import { setClausulas, setLoading, setError } from '../store/clausulasSlice';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

const UploadScreen = () => {
  const dispatch = useDispatch();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

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
      
      const response = await fetch('https://backend-production-ce11b.up.railway.app/api/analisar-contrato', {
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

      const data = await response.json();
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

  return (
    <div className="card">
      <button className="btn-back" onClick={() => dispatch(prevStep())}>&larr;</button>
      <h2 className="title">Envie seu contrato</h2>
      <div
        className={`upload-box${dragActive ? ' upload-box-active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBoxClick}
        style={{ cursor: 'pointer' }}
      >
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          style={{ display: 'none' }}
          ref={inputRef}
          onChange={handleFileChange}
        />
        <div className="upload-icon">📄</div>
        {file ? (
          <p style={{ fontWeight: 500 }}>{file.name}</p>
        ) : (
          <>
            <p>Carregue um arquivo PDF ou imagem do contrato</p>
            <span className="upload-types">PDF, JPG, PNG</span>
          </>
        )}
      </div>
      <button
        className="btn-primary"
        onClick={handleAnalyze}
        disabled={!file || uploading}
        style={{ opacity: file && !uploading ? 1 : 0.5, cursor: file && !uploading ? 'pointer' : 'not-allowed' }}
      >
        {uploading ? 'Analisando...' : 'Fazer Leitura de Contrato'}
      </button>
      <div className="upload-footer">
        {uploading ? 'Analisando contrato com IA...' : file ? 'Arquivo pronto para leitura.' : 'Estamos lendo o contrato...'}
      </div>
    </div>
  );
};

export default UploadScreen; 