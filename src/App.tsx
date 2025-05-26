import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { goToStep } from './store/stepsSlice';
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

const App = () => {
  const step = useSelector((state: RootState) => state.steps.step);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');
    if (sessionId) {
      localStorage.setItem('pago', 'true');
      dispatch(goToStep(5));
    }
  }, [location, dispatch]);

  return (
    <>
      {isAuthenticated && user && <ProfileMenu user={user} />}
      <Routes>
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/cancel" element={<CancelScreen />} />
        <Route path="/success" element={<SuccessScreen />} />
        <Route path="/analises" element={<AnalysesHistoryScreen />} />
        <Route path="/" element={
          <div className="app-bg">
            {step === 1 && <HomeScreen />}
            {step === 2 && <UploadScreen />}
            {step === 3 && <ClauseExplanationScreen />}
            {step === 4 && <SummaryScreen />}
            {step === 5 && <SuccessScreen />}
          </div>
        } />
      </Routes>
    </>
  );
};

export default App; 