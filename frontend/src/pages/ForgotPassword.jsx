import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import AuthLayout from "../layouts/AuthLayout";
import { useNotification } from "../context/NotificationContext";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await api.post("/auth/forgot-password", {
        email,
      });

      showNotification(
        response.data.message,
        "success"
      );
      setEmail("");
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
          <span className="text-2xl">🔐</span>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#26352D]">
            Forgot your password?
          </h2>

          <p className="text-[#72776F] mt-2 leading-relaxed">
            Enter your email address and we'll send you a link to
            reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-[#3E4842]">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              required
              className="w-full border border-[#E8E3D8] rounded-xl px-4 py-3.5 bg-[#F7F4ED] text-[#26352D] placeholder:text-[#72776F] outline-none focus:border-[#355E4A] focus:ring-2 focus:ring-[#DCE8DF] transition"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#355E4A] text-white py-3.5 rounded-xl font-semibold hover:bg-[#2B4D3D] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword;