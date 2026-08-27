import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import AuthLayout from "../layouts/AuthLayout";
import { useNotification } from "../context/NotificationContext";

const ResetPassword = () => {
  const { resetToken } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showNotification(
        "Passwords do not match",
        "error"
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        `/auth/reset-password/${resetToken}`,
        {
          newPassword,
        }
      );

      showNotification(
        response.data.message,
        "success"
      );

      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      showNotification(error, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div>
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#DCE8DF] flex items-center justify-center mb-6">
          <span className="text-2xl">🔑</span>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#26352D]">
            Reset your password
          </h2>

          <p className="text-[#72776F] mt-2 leading-relaxed">
            Create a new password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* New Password */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-[#3E4842]">
              New Password
            </label>

            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                className="w-full border border-[#E8E3D8] rounded-xl px-4 py-3.5 pr-20 bg-[#F7F4ED] text-[#26352D] placeholder:text-[#72776F] outline-none focus:border-[#355E4A] focus:ring-2 focus:ring-[#DCE8DF] transition"
              />

              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#355E4A] hover:text-[#2B4D3D]"
              >
                {showNewPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-[#3E4842]">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
                className="w-full border border-[#E8E3D8] rounded-xl px-4 py-3.5 pr-20 bg-[#F7F4ED] text-[#26352D] placeholder:text-[#72776F] outline-none focus:border-[#355E4A] focus:ring-2 focus:ring-[#DCE8DF] transition"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#355E4A] hover:text-[#2B4D3D]"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#355E4A] text-white py-3.5 rounded-xl font-semibold hover:bg-[#2B4D3D] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

        </form>

        {/* Back to login */}
        <div className="mt-7 pt-6 border-t border-[#E8E3D8] text-center">
          <Link
            to="/login"
            className="text-sm font-semibold text-[#355E4A] hover:text-[#2B4D3D]"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;