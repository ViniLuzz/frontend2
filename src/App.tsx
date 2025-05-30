import { Routes, Route} from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import UploadScreen from './components/UploadScreen';
import ClauseExplanationScreen from './components/ClauseExplanationScreen';
import SuccessScreen from './components/SuccessScreen';
import CancelScreen from './components/CancelScreen';
import ProfileMenu from './components/ProfileMenu';
import SummaryScreen from './components/SummaryScreen';
import RegisterScreen from './components/RegisterScreen';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import AnalysesHistoryScreen from './components/AnalysesHistoryScreen';
import { useEffect } from 'react';
import { loginSuccess } from './store/authSlice';
import { auth } from './firebase';
import PaymentStep from './components/PaymentStep';

const App = () => {
  const step = useSelector((state: RootState) => state.steps.step);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        dispatch(loginSuccess({ email: user.email || '' }));
      }
    });
    return () => unsubscribe();
  }, [dispatch]);

  return (
    <>
      {isAuthenticated && user && <ProfileMenu user={user} />}
      <Routes>
        <Route path="/register" element={<div className="app-bg"><RegisterScreen /></div>} />
        <Route path="/login" element={<div className="app-bg"><LoginScreen /></div>} />
        <Route path="/cancel" element={<div className="app-bg"><CancelScreen /></div>} />
        <Route path="/success" element={<div className="app-bg"><SuccessScreen /></div>} />
        <Route path="/analises" element={<div className="app-bg"><AnalysesHistoryScreen /></div>} />
        <Route path="/upload" element={<div className="app-bg"><UploadScreen /></div>} />
        <Route path="/pagamento" element={<div className="app-bg"><PaymentStep /></div>} />
        <Route path="/clausulas" element={<div className="app-bg"><ClauseExplanationScreen /></div>} />
        <Route path="/analise" element={<div className="app-bg"><SummaryScreen /></div>} />
        <Route path="/" element={
          <div className="app-bg">
            {step === 1 && <HomeScreen />}
            {step === 2 && <UploadScreen />}
            {step === 3 && <PaymentStep />}
            {step === 4 && <ClauseExplanationScreen />}
            {step === 5 && <SummaryScreen />}
            {step === 6 && <SuccessScreen />}
          </div>
        } />
      </Routes>
    </>
  );
};

export default App; 