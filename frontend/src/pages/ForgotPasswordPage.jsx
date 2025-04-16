import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Tilt from 'react-parallax-tilt';
import { ArrowLeft, Mail, Loader2, Sun, Moon, SendIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import ThemeToggle from '../components/common/ThemeToggle';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const { isSendingResetLink, forgotPassword } = useAuthStore();

  useEffect(() => {
    document.title = 'Forgot Password - NexusChat';
  }, []);

  const validateForm = () => {
    if (!email.trim()) {
      toast.error("Email is required");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) return;

    const sent = await forgotPassword(email);
    setEmailSent(sent);
  };

  return (
    <>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md space-y-2 p-6 sm:p-12">
          <div className="mb-4">
            <Link to="/login" className="btn btn-ghost btn-sm gap-2">
              <ArrowLeft className="size-4" />
              Back to login
            </Link>
          </div>

          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2">
              <Tilt scale={1.5} transitionSpeed={1000}>
                <div className="w-32 h-30 rounded-xl flex items-center justify-center bg-primary/10 hover:bg-primary/15 transition-colors p-4 scale-80">
                  <img src="/nexuschat_bgremoved.png" alt="NexusChat logo" className="scale-80" />
                </div>
              </Tilt>
              <h1 className="text-2xl font-bold mt-2">Reset Password</h1>
              <p className="text-base-content/60">
                {emailSent
                  ? "Check your email for reset instructions"
                  : "Enter your email to receive a password reset link"}
              </p>
            </div>
          </div>

          {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <Mail />
                  <span className="label-text font-medium">Email</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    className="input input-bordered w-full pl-3"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSendingResetLink}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full transform transition-transform duration-300 hover:scale-105"
                disabled={isSendingResetLink}
              >
                <SendIcon />
                {isSendingResetLink ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="alert alert-success">
                <p>Reset link sent! Check your inbox and spam folder.</p>
              </div>

              <button
                onClick={() => setEmailSent(false)}
                className="btn btn-outline w-full"
              >
                Try another email
              </button>

              <Link to="/login" className="btn btn-primary w-full">
                Return to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ForgotPasswordPage;