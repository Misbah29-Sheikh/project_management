import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await api.post("/auth/change-password", {
        oldPassword,
        newPassword,
      });

      showNotification(
        response.data.message,
        "success"
      );

      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      showNotification(error, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center px-6 py-10 bg-[#F7F4ED] dark:bg-[#151D18]">
      <div className="w-full max-w-lg">

        {/* Heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-[#355E4A] dark:text-[#6F9B82] mb-2">
            Account Settings
          </p>

          <h1 className="text-3xl font-bold text-[#26352D] dark:text-[#F1F4ED]">
            Change Password
          </h1>

          <p className="text-[#72776F] dark:text-[#AAB5AE] mt-2">
            Update your password to keep your account secure.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#1F2A23] border border-[#E8E3D8] dark:border-[#344238] rounded-2xl p-8">

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Current Password */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-[#3E4842] dark:text-[#F1F4ED]">
                Current Password
              </label>

              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full border border-[#E8E3D8] dark:border-[#344238] rounded-xl px-4 py-3.5 pr-20 bg-[#F7F4ED] dark:bg-[#2A382F] text-[#26352D] dark:text-[#F1F4ED] placeholder:text-[#72776F] dark:placeholder:text-[#AAB5AE] outline-none focus:border-[#355E4A] focus:ring-2 focus:ring-[#DCE8DF] transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowOldPassword(!showOldPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#355E4A] dark:text-[#6F9B82] hover:text-[#2B4D3D] dark:hover:text-[#8CAF9A]"
                >
                  {showOldPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-[#3E4842] dark:text-[#F1F4ED]">
                New Password
              </label>

              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="w-full border border-[#E8E3D8] dark:border-[#344238] rounded-xl px-4 py-3.5 pr-20 bg-[#F7F4ED] dark:bg-[#2A382F] text-[#26352D] dark:text-[#F1F4ED] placeholder:text-[#72776F] dark:placeholder:text-[#AAB5AE] outline-none focus:border-[#355E4A] focus:ring-2 focus:ring-[#DCE8DF] transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword(!showNewPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#355E4A] dark:text-[#6F9B82] hover:text-[#2B4D3D] dark:hover:text-[#8CAF9A]"
                >
                  {showNewPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#355E4A] text-white py-3.5 rounded-xl font-semibold hover:bg-[#2B4D3D] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Changing..." : "Change Password"}
            </button>

          </form>

          <div className="mt-6 pt-6 border-t border-[#E8E3D8] dark:border-[#344238] text-center">
            <Link
              to="/"
              className="text-sm font-semibold text-[#355E4A] dark:text-[#6F9B82] hover:text-[#2B4D3D] dark:hover:text-[#8CAF9A]"
            >
              ← Back to Dashboard
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ChangePassword;