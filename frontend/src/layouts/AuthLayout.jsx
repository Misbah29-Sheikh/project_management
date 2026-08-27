const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F7F4ED] flex">

      {/* Left branding section */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#26352D] relative overflow-hidden">

        {/* Decorative shapes */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#355E4A] opacity-40" />

        <div className="absolute -bottom-40 -right-32 w-[500px] h-[500px] rounded-full bg-[#355E4A] opacity-30" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-white text-[#355E4A] flex items-center justify-center font-bold text-xl">
              P
            </div>

            <span className="text-white text-xl font-bold">
              Project Camp
            </span>

          </div>

          <div className="max-w-md">

            <p className="text-[#AFC4B5] text-sm font-medium mb-4">
              PROJECT MANAGEMENT WORKSPACE
            </p>

            <h1 className="text-5xl font-bold text-white leading-tight">
              Organize work.
              <br />
              Build together.
            </h1>

            <p className="text-[#B7C3BA] mt-6 leading-relaxed">
              Manage projects, collaborate with your team,
              track tasks and keep everything organized in
              one place.
            </p>

          </div>

          <p className="text-[#84958A] text-sm">
            © 2026 Project Camp
          </p>

        </div>
      </div>

      {/* Form section */}
      <div className="flex-1 flex items-center justify-center px-5 py-10">

        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">

            <div className="w-10 h-10 rounded-xl bg-[#355E4A] text-white flex items-center justify-center font-bold">
              P
            </div>

            <span className="font-bold text-xl text-[#26352D]">
              Project Camp
            </span>

          </div>

          {children}

        </div>

      </div>

    </div>
  );
};

export default AuthLayout;