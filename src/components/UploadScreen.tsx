import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setClausulas, setLoading, setError } from '../store/clausulasSlice';
import { API_URLS } from '../config/api';

const UploadScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleBoxClick = () => inputRef.current?.click();

  const handleAnalyze = async () => {
    if (!file) return;
    setUploading(true);
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(API_URLS.ANALISAR_CONTRATO, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });

      const data = await response.json();
      if (data.clausulas && data.token) {
        dispatch(setClausulas(data.clausulas));
        navigate(`/pagamento?token=${data.token}`);
      } else {
        throw new Error(data.error || 'Resposta inválida do servidor');
      }
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'Erro ao conectar com o servidor.'));
    } finally {
      setUploading(false);
      dispatch(setLoading(false));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
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
