import React from 'react';
import { Mail, Loader2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

const OtpVerification = () => {
  const [otp, setOtp] = React.useState('');
  const { isVerifying, verify } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    verify(otp, navigate);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-6 p-6 sm:p-12 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-primary/10 hover:bg-primary/15 transition-colors p-4">
            <Mail className="size-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mt-2">Email Verification</h1>
          <p className="text-base-content/60">Enter the 6-digit code sent to your email</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <input
            type="text"
            maxLength={6}
            className="w-full tracking-[0.5em] text-center text-lg font-bold input input-bordered focus:input-primary py-3"
            value={otp}
            onChange={handleChange}
            placeholder="Enter OTP"
          />

          <button 
            className="btn btn-primary w-full"
            disabled={isVerifying || otp.length < 6}
          >
            {isVerifying ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Verify Email
                <ArrowRight className="size-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OtpVerification;
