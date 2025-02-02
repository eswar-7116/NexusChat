import React from 'react';
import { Mail, Loader2, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const OtpVerification = () => {
  const [otp, setOtp] = React.useState(['', '', '', '', '', '']);
  const { isVerifying, verify } = useAuthStore();
  const inputRefs = Array(6).fill(0).map(() => React.useRef(null)); 
  const navigate = useNavigate();

  const handleChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      if (value && index < 5) {
        inputRefs[index + 1].current.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    verify(otpCode, navigate);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-6 p-6 sm:p-12">
        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-2 group">
            <div className="w-32 h-30 rounded-xl flex items-center justify-center bg-primary/10 hover:bg-primary/15 transition-colors p-4 scale-80">
              <Mail className="size-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mt-2">Email Verification</h1>
            <p className="text-base-content/60">We have sent a code to your email</p>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                maxLength={1}
                className="w-12 h-12 text-center text-lg font-bold input input-bordered focus:input-primary"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
              />
            ))}
          </div>

          <button 
            className="btn btn-primary w-full"
            disabled={isVerifying || otp.some(digit => !digit)}
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

        {/* <div className="text-center space-y-4">
          <p className="text-base-content/60">
            Didn't receive code? 
            <button className="link link-primary font-medium ml-2">
              Resend
            </button>
          </p>
          <button className="text-sm link link-primary">
            Change email address
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default OtpVerification;