import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-2 p-6 sm:p-12">
        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-2 group">
            <div className="w-32 h-30 rounded-xl flex items-center justify-center bg-primary/10 hover:bg-primary/15 transition-colors p-4 scale-80">
              <img src="/nexuschat_bgremoved.png" alt="NexusChat logo" className="scale-80"/>
            </div>
            <h1 className="text-2xl font-bold mt-2">Change Password</h1>
            <p className="text-base-content/60">Update your account password</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Old Password</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="size-5 text-base-content/40" />
              </div>
              <input
                type={showOldPass ? "text" : "password"}
                className="input input-bordered w-full pl-10"
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
                  <EyeOff className="size-5 text-base-content/40" />
                ) : (
                  <Eye className="size-5 text-base-content/40" />
                )}
              </button>
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">New Password</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="size-5 text-base-content/40" />
              </div>
              <input
                type={showNewPass ? "text" : "password"}
                className="input input-bordered w-full pl-10"
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
                  <EyeOff className="size-5 text-base-content/40" />
                ) : (
                  <Eye className="size-5 text-base-content/40" />
                )}
              </button>
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Confirm New Password</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="size-5 text-base-content/40" />
              </div>
              <input
                type={showConfirmPass ? "text" : "password"}
                className="input input-bordered w-full pl-10"
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
                  <EyeOff className="size-5 text-base-content/40" />
                ) : (
                  <Eye className="size-5 text-base-content/40" />
                )}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full" 
            disabled={isChangingPass}
          >
            {isChangingPass ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Updating...
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