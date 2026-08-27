import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import AuthLayout from "../layouts/AuthLayout";
import { useNotification } from "../context/NotificationContext";

const Register = () => {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await api.post("/auth/register", {
        username,
        fullName,
        email,
        password,
      });

      navigate("/login");
    } catch (error) {
      showNotification(error, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div>
        {/* Heading */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#26352D]">
            Create your account
          </h2>

          <p className="text-[#72776F] mt-2">
            Set up your account and start managing your projects.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Username */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-[#3E4842]">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              required
              className="w-full border border-[#E8E3D8] rounded-xl px-4 py-3.5 bg-[#F7F4ED] text-[#26352D] placeholder:text-[#72776F] outline-none focus:border-[#355E4A] focus:ring-2 focus:ring-[#DCE8DF] transition"
            />

            <p className="text-xs text-[#72776F] mt-2">
              Username must be at least 3 characters and lowercase.
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-[#3E4842]">
              Full Name
            </label>

            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full border border-[#E8E3D8] rounded-xl px-4 py-3.5 bg-[#F7F4ED] text-[#26352D] placeholder:text-[#72776F] outline-none focus:border-[#355E4A] focus:ring-2 focus:ring-[#DCE8DF] transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-[#3E4842]">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full border border-[#E8E3D8] rounded-xl px-4 py-3.5 bg-[#F7F4ED] text-[#26352D] placeholder:text-[#72776F] outline-none focus:border-[#355E4A] focus:ring-2 focus:ring-[#DCE8DF] transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-[#3E4842]">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                className="w-full border border-[#E8E3D8] rounded-xl px-4 py-3.5 pr-20 bg-[#F7F4ED] text-[#26352D] placeholder:text-[#72776F] outline-none focus:border-[#355E4A] focus:ring-2 focus:ring-[#DCE8DF] transition"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#355E4A] hover:text-[#2B4D3D]"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#355E4A] text-white py-3.5 rounded-xl font-semibold hover:bg-[#2B4D3D] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

        </form>

        {/* Login */}
        <div className="mt-7 pt-6 border-t border-[#E8E3D8] text-center">
          <p className="text-sm text-[#72776F]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#355E4A] hover:text-[#2B4D3D]"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Register;