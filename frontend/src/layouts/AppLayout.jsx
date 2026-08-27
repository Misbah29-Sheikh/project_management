import { Outlet } from "react-router-dom";
import AppHeader from "../components/AppHeader";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-[#F7F4ED] dark:bg-[#151C18] text-[#26352D] dark:text-[#F1F4ED]">
      <AppHeader />

      <main className="lg:ml-64 min-h-[calc(100vh-72px)]">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;