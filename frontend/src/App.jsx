import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useEffect, useState } from 'react';
import { PropagateLoader } from 'react-spinners';
import toast, { Toaster } from 'react-hot-toast';

import NavBar from './components/layout/NavBar';
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

  const location = useLocation();
  const isNot404 = location.pathname !== '/404';

  useEffect(() => {
    function handleOffline() {
      toast.error("No Internet!");
    }
    
    function handleOnline() {
      toast.success("Back online!");
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    }
  }, []);

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
      { user && isNot404 && <NavBar /> }

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

        {/* 404 Not Found Page */}
        <Route path='/404' element={<NotFoundPage />} />
        <Route path='*' element={<Navigate to="/404" replace />} />
      </Routes>

      <Toaster />
    </div>
  )
}

export default App;