import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import AuthLayout from "../layouts/AuthLayout.jsx";
import { useNotification } from "../context/NotificationContext";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await api.post("/auth/login", formData);

      setUser(response.data.data.user);

      navigate("/");
    } catch (error) {
      showNotification(error, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-xl shadow-lg p-8 border border-[#E8E3D8]">

        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#26352D]">
            Welcome back
          </h2>

          <p className="text-[#72776F] mt-2">
            Login to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#3E4842] mb-2"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-[#D8D5CC] rounded-lg px-4 py-3 bg-[#FCFBF8] text-[#26352D] outline-none transition focus:border-[#355E4A] focus:ring-1 focus:ring-[#355E4A]"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-[#3E4842]"
              >
                Password
              </label>

              <Link
                to="/forgot-password"
                className="text-sm font-medium text-[#355E4A] hover:text-[#26352D]"
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full border border-[#D8D5CC] rounded-lg px-4 py-3 pr-20 bg-[#FCFBF8] text-[#26352D] outline-none transition focus:border-[#355E4A] focus:ring-1 focus:ring-[#355E4A]"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[#355E4A] hover:text-[#26352D]"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#355E4A] text-white py-3 rounded-lg font-semibold hover:bg-[#2B4D3D] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {/* Register */}
        <p className="text-center text-sm text-[#72776F] mt-7">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-[#355E4A] hover:text-[#26352D]"
          >
            Create an account
          </Link>
        </p>

      </div>
    </AuthLayout>
  );
};

export default Login;