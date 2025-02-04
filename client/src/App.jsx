import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';
import { PropagateLoader } from 'react-spinners';
import { Toaster } from 'react-hot-toast';

import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import OtpVerification from './pages/OtpVerification';
import LoginPage from './pages/LoginPage';

function App() {
  const { user, checkAuth, isCheckingAuth, otpSent } = useAuthStore();

  useEffect(() => {
    checkAuth()
  }, [checkAuth]);

  if (isCheckingAuth && !user) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <PropagateLoader color="#b5b3b3" />
      </div>
    );
  }

  return (
    <div>
      { user && <NavBar /> }

      <Routes>
        <Route path='/' element={ user ? <HomePage /> : <LoginPage /> } />
        <Route path='/signup' element={ <SignUpPage /> } />
        <Route path='/verify' element={ user ? <HomePage /> : otpSent ? <OtpVerification /> : <SignUpPage /> } />
        <Route path='/login' element={ <LoginPage /> } />
      </Routes>

      <Toaster />
    </div>
  )
}

export default App;