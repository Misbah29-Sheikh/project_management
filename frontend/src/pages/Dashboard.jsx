import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/dashboard");

      setDashboard(response.data.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#72776F] dark:text-[#AAB5AE]">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-[#1F2A23] border border-[#E8E3D8] dark:border-[#344238] rounded-2xl p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const { stats, recentProjects, recentTasks } = dashboard;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#26352D] dark:text-[#F1F4ED]">
          Welcome back, {user?.username} 👋
        </h1>

        <p className="text-[#72776F] dark:text-[#AAB5AE] mt-2">
          Here's what's happening with your projects.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-4">

        <div className="bg-white dark:bg-[#1F2A23] border border-[#E8E3D8] dark:border-[#344238] rounded-2xl p-6">
          <p className="text-sm text-[#72776F] dark:text-[#AAB5AE]">
            Total Projects
          </p>

          <p className="text-3xl font-bold text-[#26352D] dark:text-[#F1F4ED] mt-2">
            {stats.totalProjects}
          </p>
        </div>

        <div className="bg-white dark:bg-[#1F2A23] border border-[#E8E3D8] dark:border-[#344238] rounded-2xl p-6">
          <p className="text-sm text-[#72776F] dark:text-[#AAB5AE]">
            Total Tasks
          </p>

          <p className="text-3xl font-bold text-[#26352D] dark:text-[#F1F4ED] mt-2">
            {stats.totalTasks}
          </p>
        </div>

        <div className="bg-white dark:bg-[#1F2A23] border border-[#E8E3D8] dark:border-[#344238] rounded-2xl p-6">
          <p className="text-sm text-[#72776F] dark:text-[#AAB5AE]">
            Completed Tasks
          </p>

          <p className="text-3xl font-bold text-[#355E4A] dark:text-[#F1F4ED] mt-2">
            {stats.completedTasks}
          </p>
        </div>

        <div className="bg-white dark:bg-[#1F2A23] border border-[#E8E3D8] dark:border-[#344238] rounded-2xl p-6">
          <p className="text-sm text-[#72776F] dark:text-[#AAB5AE]">
            Pending Tasks
          </p>

          <p className="text-3xl font-bold text-[#26352D] dark:text-[#F1F4ED] mt-2">
            {stats.pendingTasks}
          </p>
        </div>

      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-2 mt-4">
          <h2 className="text-xl font-bold text-[#26352D] dark:text-[#F1F4ED]">
            Recent Projects
          </h2>

          <Link
            to="/projects"
            className="text-sm font-semibold text-[#355E4A] dark:text-[#6F9B82] hover:text-[#2B4D3D] dark:hover:text-[#8CAF9A]"
          >
            View all
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="bg-white dark:bg-[#1F2A23] border border-[#E8E3D8] dark:border-[#344238] rounded-2xl p-6">
            <p className="text-[#72776F] dark:text-[#AAB5AE]">
              You don't have any projects yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {recentProjects.map((project) => (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className="block bg-white dark:bg-[#1F2A23] border border-[#E8E3D8] dark:border-[#344238] rounded-2xl p-6 hover:border-[#D4E0D8] dark:hover:border-[#4A5C50] hover:shadow-sm transition">
                <h3 className="text-lg font-bold text-[#26352D] dark:text-[#F1F4ED]">
                  {project.name}
                </h3>

                <p className="text-[#72776F] dark:text-[#AAB5AE] text-sm mt-2 line-clamp-2">
                  {project.description ||
                    "No description provided."}
                </p>

                <div className="flex items-center justify-between mt-5">
                  <span className="text-sm text-[#72776F] dark:text-[#AAB5AE]">
                    {project.members} members
                  </span>

                  <span className="text-sm font-semibold text-[#355E4A] dark:text-[#6F9B82]">
                    View project →
                  </span>
                </div>
              </Link>
            ))}

          </div>
        )}
      </div>

      {/* Recent Tasks */}
      <div>
        <h2 className="text-xl font-bold text-[#26352D] dark:text-[#F1F4ED] mb-2 mt-4">
          Recent Tasks
        </h2>

        {recentTasks.length === 0 ? (
          <div className="bg-white dark:bg-[#1F2A23] border border-[#E8E3D8] dark:border-[#344238] rounded-2xl p-6">
            <p className="text-[#72776F] dark:text-[#AAB5AE]">
              No tasks yet.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1F2A23] border border-[#E8E3D8] dark:border-[#344238] rounded-2xl overflow-hidden">

            {recentTasks.map((task) => (
              <Link
                key={task._id}
                to={`/projects/${task.project._id}/tasks/${task._id}`}
                className="flex items-center justify-between gap-4 p-5 border-b last:border-b-0 border-[#E8E3D8] dark:border-[#344238] hover:bg-[#F7F4ED] dark:hover:bg-[#2A382F] transition"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-[#26352D] dark:text-[#F1F4ED] truncate">
                    {task.title}
                  </p>

                  <p className="text-sm text-[#72776F] dark:text-[#AAB5AE] mt-1">
                    {task.project.name}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">

                  <span className="px-3 py-1 rounded-full bg-[#E8EFEA] dark:bg-[#30463A] text-[#355E4A] dark:text-[#DCE8DF] text-xs font-semibold capitalize">
                    {task.status.replace("_", " ")}
                  </span>

                  {task.assignedTo && (
                    <span className="text-sm text-[#72776F] dark:text-[#AAB5AE] hidden sm:block">
                      @{task.assignedTo.username}
                    </span>
                  )}

                </div>
              </Link>
            ))}

          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;