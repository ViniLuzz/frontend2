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