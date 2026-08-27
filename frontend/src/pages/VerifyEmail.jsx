import { Link, useSearchParams } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();

  const status = searchParams.get("status");
  const isSuccess = status === "success";

  return (
    <AuthLayout>
      <div className="text-center">

        {isSuccess ? (
          <>
            {/* Success Icon */}
            <div className="mx-auto mb-6 flex items-center justify-center w-16 h-16 rounded-2xl bg-[#DCE8DF]">
              <span className="text-3xl font-semibold text-[#355E4A]">
                ✓
              </span>
            </div>

            <h2 className="text-3xl font-bold text-[#26352D]">
              Email verified!
            </h2>

            <p className="text-[#72776F] mt-3 leading-relaxed">
              Your email has been successfully verified.
              <br />
              Your account is now ready to use.
            </p>

            <Link
              to="/login"
              className="block w-full mt-8 bg-[#355E4A] text-white py-3.5 rounded-xl font-semibold hover:bg-[#2B4D3D] transition"
            >
              Continue to Sign In
            </Link>
          </>
        ) : (
          <>
            {/* Error Icon */}
            <div className="mx-auto mb-6 flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 border border-red-100">
              <span className="text-3xl font-semibold text-red-600">
                !
              </span>
            </div>

            <h2 className="text-3xl font-bold text-[#26352D]">
              Verification failed
            </h2>

            <p className="text-[#72776F] mt-3 leading-relaxed">
              This verification link is invalid or has expired.
            </p>

            <div className="mt-8 space-y-3">
              <Link
                to="/login"
                className="block w-full bg-[#355E4A] text-white py-3.5 rounded-xl font-semibold hover:bg-[#2B4D3D] transition"
              >
                Back to Sign In
              </Link>

              <Link
                to="/resend-email-verification"
                className="block w-full border border-[#E8E3D8] text-[#355E4A] py-3.5 rounded-xl font-semibold hover:bg-[#F7F4ED] transition"
              >
                Resend Verification Email
              </Link>
            </div>
          </>
        )}

      </div>
    </AuthLayout>
  );
};

export default VerifyEmail;