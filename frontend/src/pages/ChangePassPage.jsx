import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Lock, Eye, EyeOff, Loader2, KeyRound } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { isPassNotValid } from '../helpers/passwordValidation';

function ChangePassPage() {
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();
  const { changePass, isChangingPass } = useAuthStore();

  useEffect(() => {
    document.title = 'Change Password - NexusChat';
  }, []);

  const validateForm = () => {
    if (!formData.oldPassword.trim())
      return toast.error("Old Password is required");

    if (!formData.newPassword.trim())
      return toast.error("New Password is required");

    const oldPassError = isPassNotValid(formData.oldPassword);
    if (oldPassError)
      return toast.error(oldPassError);

    const newPassError = isPassNotValid(formData.newPassword);
    if (newPassError)
      return toast.error(newPassError);

    if (formData.newPassword !== formData.confirmPassword)
      return toast.error("New password does not match with confirm password");

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isInputValid = validateForm();
    if (isInputValid) changePass(formData, navigate);
  };

  return (
    <div className="h-full flex-grow flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-2">
        <div className="text-center mb-6">
          <div className="flex flex-col items-center gap-2">
            <div className="w-24 h-24 rounded-xl flex items-center justify-center bg-primary/10 hover:bg-primary/15 transition-colors p-3">
              <img src="/nexuschat_bgremoved.png" alt="NexusChat logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold mt-2">Change Password</h1>
            <p className="text-sm text-base-content/60">Update your account password</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="form-control">
            <label className="label">
              <Lock />
              <span className="label-text font-medium">Old Password</span>
            </label>
            <div className="relative">
              <input
                type={showOldPass ? "text" : "password"}
                className="input input-bordered w-full pl-3 text-sm sm:text-base py-2"
                placeholder="Enter Old Password"
                value={formData.oldPassword}
                onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowOldPass(!showOldPass)}
              >
                {showOldPass ? (
                  <EyeOff className="size-4 sm:size-5 text-base-content/40" />
                ) : (
                  <Eye className="size-4 sm:size-5 text-base-content/40" />
                )}
              </button>
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <Lock />
              <span className="label-text font-medium">New Password</span>
            </label>
            <div className="relative">
              <input
                type={showNewPass ? "text" : "password"}
                className="input input-bordered w-full pl-3 text-sm sm:text-base py-2"
                placeholder="Enter New Password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowNewPass(!showNewPass)}
              >
                {showNewPass ? (
                  <EyeOff className="size-4 sm:size-5 text-base-content/40" />
                ) : (
                  <Eye className="size-4 sm:size-5 text-base-content/40" />
                )}
              </button>
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <Lock />
              <span className="label-text font-medium">Confirm New Password</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPass ? "text" : "password"}
                className="input input-bordered w-full pl-3 text-sm sm:text-base py-2"
                placeholder="Confirm New Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
              >
                {showConfirmPass ? (
                  <EyeOff className="size-4 sm:size-5 text-base-content/40" />
                ) : (
                  <Eye className="size-4 sm:size-5 text-base-content/40" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full mt-6 transform transition-transform duration-300 hover:scale-105"
            disabled={isChangingPass}
          >
            <KeyRound />
            {isChangingPass ? (
              <>
                <Loader2 className="size-4 sm:size-5 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              "Change Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassPage;