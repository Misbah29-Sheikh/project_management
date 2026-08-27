import { useState } from "react";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext";

const ResendEmailVerification = () => {
  const { showNotification } = useNotification()
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    try {
      setLoading(true);

      const response = await api.post(
        "/auth/resend-email-verification"
      );

      showNotification(
        response.data.message,
        "success"
      );
    } catch (error) {
      showNotification(
        error.response?.data?.message ||
        "Something went wrong while sending the verification email",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

   return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center px-6 py-10 bg-[#F7F4ED] dark:bg-[#151D18]">
      <div className="w-full max-w-lg">

        {/* Heading */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-[#DCE8DF] dark:bg-[#30463A] flex items-center justify-center">
            <span className="text-3xl">✉</span>
          </div>

          <h1 className="text-3xl font-bold text-[#26352D] dark:text-[#F1F4ED]">
            Verify your email
          </h1>

          <p className="text-[#72776F] dark:text-[#AAB5AE] mt-2 leading-relaxed">
            Your email address hasn't been verified yet.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#1F2A23] border border-[#E8E3D8] dark:border-[#344238] rounded-2xl p-8">

          <h2 className="text-lg font-semibold text-[#26352D] dark:text-[#F1F4ED]">
            Email verification
          </h2>

          <p className="text-sm text-[#72776F] dark:text-[#AAB5AE] mt-2 leading-relaxed">
            Request a new verification link and check your inbox.
            If you don't see it, check your spam or junk folder.
          </p>

          <button
            onClick={handleResend}
            disabled={loading}
            className="w-full mt-6 bg-[#355E4A] text-white py-3.5 rounded-xl font-semibold hover:bg-[#2B4D3D] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Sending..."
              : "Resend Verification Email"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default ResendEmailVerification;