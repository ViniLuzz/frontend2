
const CancelScreen = () => (
  <div className="card" style={{ maxWidth: 400, textAlign: 'center' }}>
    <h2 className="title">Pagamento cancelado</h2>
    <p style={{ color: '#ef4444', fontWeight: 600, fontSize: 18, margin: '20px 0' }}>Você cancelou o pagamento. A análise não foi liberada.</p>
    <a href="/" className="btn-primary" style={{ display: 'inline-block', marginTop: 16 }}>Tentar novamente</a>
  </div>
);

export default CancelScreen; 