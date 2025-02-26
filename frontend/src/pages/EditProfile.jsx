import React from "react";
import { Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../stores/authStore";
import toast from "react-hot-toast";

function EditProfile() {
  const { user, isUpdatingProfilePic, updateProfilePic } = useAuthStore();
  const [selectedPic, setSelectedPic] = React.useState(null);
  const navigate = useNavigate();

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
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold ">{ user.fullName }</h1>
          </div>
        
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedPic || user.profilePic || "/profile.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 "
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfilePic ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
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
            <p className="text-sm text-zinc-400">
              {isUpdatingProfilePic ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div className="flex flex-col items-start py-2 px-8">
            <div className="flex items-center gap-2 mb-2">
              <span><b>Username: </b></span>
              <span>{user.username}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span><b>E-mail: </b></span>
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span><b>Member Since: </b></span>
              <span>{user.createdAt?.split("T")[0]}</span>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              className="btn btn-primary mx-2"
              onClick={handleUpdateProfilePic}
              disabled={isUpdatingProfilePic}
            >
              {isUpdatingProfilePic ? "Updating..." : "Update Profile Pic"}
            </button>
            <button
              className="btn btn-ghost mx-2"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditProfile;