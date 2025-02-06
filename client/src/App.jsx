import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useEffect } from 'react';
import { PropagateLoader } from 'react-spinners';
import { Toaster } from 'react-hot-toast';

import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import OtpVerification from './pages/OtpVerification';
import LoginPage from './pages/LoginPage';
import ChangePassPage from './pages/ChangePassPage';

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
        <Route path='/' element={user ? <HomePage /> : <Navigate to="/login" />} />
        <Route path='/signup' element={!user ? <SignUpPage /> : <Navigate to="/" />} />
        <Route 
          path='/verify' 
          element={
            user ? 
            <HomePage /> : 
            otpSent ? 
              <OtpVerification /> : 
              <Navigate to="/signup" />
          } 
        />
        <Route path='/login' element={!user ? <LoginPage /> : <Navigate to="/" />} />
        <Route path='/change-pass' element={user ? <ChangePassPage /> : <Navigate to="/" />} />
      </Routes>

      <Toaster />
    </div>
  )
}

export default App;