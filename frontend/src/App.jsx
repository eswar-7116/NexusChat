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
import EditProfile from './pages/EditProfile';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotFoundPage from './pages/NotFoundPage';

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
        
        <Route path='/edit-profile' element={user ? <EditProfile /> : <Navigate to="/" />} />

        <Route path='/forgot-password' element={!user ? <ForgotPasswordPage /> : <Navigate to="/" />} />

        <Route path='/reset-password/:id/:token' element={!user ? <ResetPasswordPage /> : <Navigate to="/" />} />

        <Route path='*' element={<NotFoundPage />} />
      </Routes>

      <Toaster />
    </div>
  )
}

export default App;