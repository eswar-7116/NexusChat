import { useState, useEffect } from "react";
import { Camera, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../stores/authStore";
import toast from "react-hot-toast";

function EditProfile() {
  const { user, isUpdatingProfilePic, updateProfilePic } = useAuthStore();
  const [selectedPic, setSelectedPic] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Profile - NexusChat';
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      setSelectedPic(reader.result);
    }
  };

  const handleUpdateProfilePic = async () => {
    if (!selectedPic) {
      toast.error("Please select a photo to update your profile pic");
      return;
    }

    await updateProfilePic({profilePic: selectedPic});
    navigate(-1);
  }

  return (
    <div className="h-full flex-grow flex flex-col p-4">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-base-300 rounded-xl p-4 sm:p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-semibold">{user.fullName}</h1>
          </div>
        
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <img
                src={selectedPic || user.profilePic || "/profile.png"}
                alt="Profile"
                className="size-24 sm:size-32 rounded-full object-cover border-4"
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-1.5 sm:p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfilePic ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfilePic}
                />
              </label>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 text-center">
              {isUpdatingProfilePic ? "Uploading..." : "Tap the camera icon to update your photo"}
            </p>
          </div>

          <div className="flex flex-col items-start py-2 px-2 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-3 w-full">
              <span className="font-medium">Username:</span>
              <span className="text-sm sm:text-base">{user.username}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-3 w-full">
              <span className="font-medium">Email:</span>
              <span className="text-sm sm:text-base break-all">{user.email}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-3 w-full">
              <span className="font-medium">Member Since:</span>
              <span className="text-sm sm:text-base">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              className="btn btn-primary w-full sm:w-auto"
              onClick={handleUpdateProfilePic}
              disabled={isUpdatingProfilePic}
            >
              {isUpdatingProfilePic ?
              <>
                <Loader2 className="size-4 sm:size-5 animate-spin" />
                <span>Updating...</span>
              </>
              : "Update Profile Pic"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditProfile;