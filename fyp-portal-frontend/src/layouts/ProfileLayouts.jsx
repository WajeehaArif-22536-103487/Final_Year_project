import React, { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Shield,
  CheckCircle,
  Calendar,
  Edit2,
  Save,
  X,
  Camera,
  Phone,
  Building,
  Briefcase,
  FileText,
  Lock,
  Eye,
  EyeOff,
  Upload,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";
import API from "../services/api";
import { useAuth } from "../hooks/useAuth";

const ProfileLayout = ({
  userRole,
  additionalFields = [],
  customSections = [],
}) => {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const fileInputRef = useRef(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await API.get("/auth/profile");

      // Check if response has data
      if (response.data) {
        setProfile(response.data);
        setEditData({
          name: response.data.name || "",
          email: response.data.email || "",
          phone: response.data.phone || "",
          department: response.data.department || "",
          designation: response.data.designation || "",
          bio: response.data.bio || "",
          ...additionalFields.reduce((acc, field) => {
            acc[field.name] = response.data[field.name] || "";
            return acc;
          }, {}),
        });
      } else {
        throw new Error("No data received");
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      console.error("Error details:", err.response?.data);
      toast.error(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await API.put("/auth/profile", editData);
      setProfile(response.data);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: profile?.name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      department: profile?.department || "",
      designation: profile?.designation || "",
      bio: profile?.bio || "",
      ...additionalFields.reduce((acc, field) => {
        acc[field.name] = profile?.[field.name] || "";
        return acc;
      }, {}),
    });
    setIsEditing(false);
  };
  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only image files are allowed (JPEG, PNG, GIF, WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("profilePicture", file);

    setUploadingPicture(true);
    try {
      const response = await API.post(
        "/auth/profile/upload-picture",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      console.log("Upload success:", response.data);

      // Fetch the complete updated profile
      const profileResponse = await API.get("/auth/profile");
      setProfile(profileResponse.data);

      // Update user in context - THIS NOW WORKS
      if (updateUser) {
        updateUser({ profilePicture: response.data.profilePicture });
      }

      // Dispatch event for navbar
      window.dispatchEvent(
        new CustomEvent("profilePictureUpdated", {
          detail: { profilePicture: response.data.profilePicture },
        }),
      );

      toast.success("Profile picture updated!");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.response?.data?.message || "Failed to upload picture");
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      await API.post("/auth/profile/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password changed successfully!");
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getInitials = (name) => {
    return name?.charAt(0)?.toUpperCase() || "U";
  };

  // Update the getProfileImageUrl function in ProfileLayout.jsx
  const getProfileImageUrl = () => {
    if (!profile?.profilePicture) return null;

    // If it's already a full URL
    if (profile.profilePicture.startsWith("http")) {
      return profile.profilePicture;
    }
    // If it starts with /uploads, add base URL
    if (profile.profilePicture.startsWith("/uploads")) {
      return `http://localhost:5000${profile.profilePicture}`;
    }
    // If it's just the filename
    return `http://localhost:5000/uploads/${profile.profilePicture}`;
  };

  // Role-specific gradient colors
  const roleColors = {
    admin: "from-brand-teal to-emerald-600",
    teacher: "from-brand-teal to-teal-600",
    student: "from-brand-teal to-cyan-600",
  };

  const gradientColor =
    roleColors[userRole] || "from-brand-teal to-emerald-500";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Profile Header - Modern Design */}
      <div className="relative mb-8">
        <div
          className={`h-40 bg-gradient-to-r ${gradientColor} rounded-2xl`}
        ></div>

        {/* Profile Picture Section */}
        <div className="absolute -bottom-16 left-8">
          <div className="relative group">
            <div className="w-32 h-32 bg-white dark:bg-brand-muted rounded-2xl flex items-center justify-center shadow-xl border-4 border-white dark:border-brand-dark overflow-hidden">
              {getProfileImageUrl() ? (
                <img
                  src={getProfileImageUrl()}
                  alt={profile?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-5xl font-bold text-brand-teal">
                  {getInitials(profile?.name)}
                </span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPicture}
              className="absolute bottom-0 right-0 p-2 bg-brand-teal text-white rounded-full shadow-lg hover:bg-teal-600 transition-all disabled:opacity-50"
            >
              {uploadingPicture ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <Camera size={16} />
              )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleProfilePictureUpload}
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              className="hidden"
            />
          </div>
        </div>

        {/* User Info */}
        <div className="absolute -bottom-16 left-44">
          <h1 className="text-2xl font-black dark:text-white">
            {profile?.name || "User"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 capitalize">
            {userRole} Account • {profile?.email}
          </p>
        </div>

        {/* Edit Button */}
        <div className="absolute bottom-4 right-6">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-brand-dark text-slate-700 dark:text-white rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-teal-900/20 transition-all shadow-md"
            >
              <Edit2 size={16} /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all disabled:opacity-50"
              >
                <Save size={16} /> {isSaving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all"
              >
                <X size={16} /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Grid Layout */}
      <div className="grid lg:grid-cols-3 gap-6 mt-20">
        {/* Left Column - Personal Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Card */}
          <div className="bg-white dark:bg-brand-muted rounded-2xl p-6 shadow-lg border dark:border-teal-900/20">
            <h2 className="text-xl font-bold dark:text-white mb-4 flex items-center gap-2">
              <User size={20} className="text-brand-teal" />
              Personal Information
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-teal-900/30 bg-white dark:bg-brand-dark dark:text-white focus:ring-2 ring-brand-teal outline-none"
                  />
                ) : (
                  <p className="text-lg font-semibold dark:text-white">
                    {profile?.name || "Not set"}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) =>
                      setEditData({ ...editData, email: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-teal-900/30 bg-white dark:bg-brand-dark dark:text-white focus:ring-2 ring-brand-teal outline-none"
                  />
                ) : (
                  <p className="text-lg font-semibold dark:text-white">
                    {profile?.email || "Not set"}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  <Phone size={14} className="inline mr-1" /> Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) =>
                      setEditData({ ...editData, phone: e.target.value })
                    }
                    placeholder="+92 XXX XXXXXXX"
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-teal-900/30 bg-white dark:bg-brand-dark dark:text-white focus:ring-2 ring-brand-teal outline-none"
                  />
                ) : (
                  <p className="text-lg font-semibold dark:text-white">
                    {profile?.phone || "Not set"}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  <Building size={14} className="inline mr-1" /> Department
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.department}
                    onChange={(e) =>
                      setEditData({ ...editData, department: e.target.value })
                    }
                    placeholder="e.g., Computer Science"
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-teal-900/30 bg-white dark:bg-brand-dark dark:text-white focus:ring-2 ring-brand-teal outline-none"
                  />
                ) : (
                  <p className="text-lg font-semibold dark:text-white">
                    {profile?.department || "Not set"}
                  </p>
                )}
              </div>

              {userRole === "teacher" && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    <Briefcase size={14} className="inline mr-1" /> Designation
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.designation}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          designation: e.target.value,
                        })
                      }
                      placeholder="e.g., Assistant Professor"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-teal-900/30 bg-white dark:bg-brand-dark dark:text-white focus:ring-2 ring-brand-teal outline-none"
                    />
                  ) : (
                    <p className="text-lg font-semibold dark:text-white">
                      {profile?.designation || "Not set"}
                    </p>
                  )}
                </div>
              )}

              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  <FileText size={14} className="inline mr-1" /> Bio / About
                </label>
                {isEditing ? (
                  <textarea
                    value={editData.bio}
                    onChange={(e) =>
                      setEditData({ ...editData, bio: e.target.value })
                    }
                    rows="3"
                    placeholder="Tell us about yourself..."
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-teal-900/30 bg-white dark:bg-brand-dark dark:text-white focus:ring-2 ring-brand-teal outline-none resize-none"
                  />
                ) : (
                  <p className="text-slate-600 dark:text-slate-300">
                    {profile?.bio || "No bio added yet"}
                  </p>
                )}
              </div>
            </div>

            {/* Additional Fields (role-specific) */}
            {additionalFields.map((field) => (
              <div key={field.name} className="mt-4">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  {field.label}
                </label>
                {isEditing && field.editable !== false ? (
                  <input
                    type={field.type || "text"}
                    value={editData[field.name]}
                    onChange={(e) =>
                      setEditData({ ...editData, [field.name]: e.target.value })
                    }
                    placeholder={field.placeholder}
                    disabled={field.disabled}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-teal-900/30 bg-white dark:bg-brand-dark dark:text-white focus:ring-2 ring-brand-teal outline-none disabled:opacity-50 disabled:bg-slate-100"
                  />
                ) : (
                  <p className="text-lg font-semibold dark:text-white">
                    {profile?.[field.name] || field.defaultValue || "Not set"}
                  </p>
                )}
                {field.hint && (
                  <p className="text-xs text-amber-500 mt-1">{field.hint}</p>
                )}
              </div>
            ))}
          </div>

          {/* Custom Sections */}
          {customSections.map((section, index) => (
            <div
              key={index}
              className="bg-white dark:bg-brand-muted rounded-2xl p-6 shadow-lg border dark:border-teal-900/20"
            >
              <h2 className="text-xl font-bold dark:text-white mb-4 flex items-center gap-2">
                {section.icon}
                {section.title}
              </h2>
              {section.content(profile, isEditing, editData, setEditData)}
            </div>
          ))}
        </div>

        {/* Right Column - Account & Security */}
        <div className="space-y-6">
          {/* Account Information Card */}
          <div className="bg-white dark:bg-brand-muted rounded-2xl p-6 shadow-lg border dark:border-teal-900/20">
            <h2 className="text-xl font-bold dark:text-white mb-4 flex items-center gap-2">
              <Shield size={20} className="text-brand-teal" />
              Account Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Role
                </label>
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-brand-teal" />
                  <p className="text-lg font-semibold dark:text-white capitalize">
                    {profile?.role || userRole}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Account Status
                </label>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <p className="text-lg font-semibold text-green-600 capitalize">
                    {profile?.status || "Active"}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Member Since
                </label>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400" />
                  <p className="text-lg font-semibold dark:text-white">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Last Updated
                </label>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400" />
                  <p className="text-lg font-semibold dark:text-white">
                    {profile?.updatedAt
                      ? new Date(profile.updatedAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Card - Change Password */}
          <div className="bg-white dark:bg-brand-muted rounded-2xl p-6 shadow-lg border dark:border-teal-900/20">
            <h2 className="text-xl font-bold dark:text-white mb-4 flex items-center gap-2">
              <Lock size={20} className="text-brand-teal" />
              Security
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              Change your password to keep your account secure.
            </p>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full py-3 bg-slate-100 dark:bg-brand-dark text-slate-700 dark:text-white rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-teal-900/20 transition-all flex items-center justify-center gap-2"
            >
              <Lock size={16} />
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-brand-muted rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold dark:text-white">
                Change Password
              </h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-teal-900/30 bg-white dark:bg-brand-dark dark:text-white focus:ring-2 ring-brand-teal outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-teal-900/30 bg-white dark:bg-brand-dark dark:text-white focus:ring-2 ring-brand-teal outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-teal-900/30 bg-white dark:bg-brand-dark dark:text-white focus:ring-2 ring-brand-teal outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="flex-1 bg-brand-teal text-white py-3 rounded-xl font-bold hover:bg-teal-600 transition-all disabled:opacity-50"
                >
                  {isChangingPassword ? "Changing..." : "Change Password"}
                </button>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 bg-slate-200 dark:bg-brand-dark text-slate-700 dark:text-white py-3 rounded-xl font-bold hover:bg-slate-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileLayout;
