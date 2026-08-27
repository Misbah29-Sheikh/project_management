import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  const fetchProjects = async () => {
    try {
      setLoading(true);

      const response = await api.get("/projects");

      setProjects(response.data.data);
    } catch (error) {
      showNotification(
        error.response?.data?.message ||
        "Something went wrong while fetching projects",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-73px)]">
        <p className="text-[#72776F] dark:text-[#AAB5AE]">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="px-5 sm:px-8 lg:px-10 py-8">

      <div className="max-w-7xl mx-auto">

        {/* Page heading */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-8">

          <div>
            <p className="text-sm font-medium text-[#6B746D] dark:text-[#8F9C94] mb-2">
              Workspace
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-[#26352D] dark:text-[#F1F4ED]">
              Your Projects
            </h1>

            <p className="text-[#7B847E] dark:text-[#AAB5AE] mt-2">
              Manage your projects and collaborate with your team.
            </p>
          </div>

          <Link
            to="/projects/create"
            className="inline-flex items-center justify-center gap-2 bg-[#355E4A] hover:bg-[#2B4D3D] text-white px-5 py-3 rounded-xl font-semibold transition shadow-sm"
          >
            <span className="text-lg">+</span>
            New Project
          </Link>

        </div>

        {/* Empty state */}
        {projects.length === 0 && (
          <div className="bg-white dark:bg-[#1F2A23] border border-[#E8E3D8] dark:border-[#344238] rounded-2xl p-12 text-center">

            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#DCE8DF] dark:bg-[#30463A] flex items-center justify-center text-2xl text-[#355E4A] dark:text-[#DCE8DF]">
              ▣
            </div>

            <h2 className="text-xl font-bold text-[#26352D] dark:text-[#F1F4ED] mt-5">
              No projects yet
            </h2>

            <p className="text-[#7B847E] dark:text-[#AAB5AE] mt-2 max-w-sm mx-auto">
              Create your first project and start collaborating
              with your team.
            </p>

            <Link
              to="/projects/create"
              className="inline-block mt-6 bg-[#355E4A] text-white px-5 py-3 rounded-xl font-semibold"
            >
              Create Project
            </Link>

          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

            {projects.map((item) => {
              const project = item.projects;

              return (
                <Link
                  key={project._id}
                  to={`/projects/${project._id}`}
                  className="group bg-white dark:bg-[#1F2A23] border border-[#E8E3D8] dark:border-[#344238] rounded-2xl p-6 hover:border-[#C5D6CA] dark:hover:border-[#4A5C50] hover:shadow-lg hover:shadow-[#26352D]/5 transition-all duration-200"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="w-11 h-11 rounded-xl bg-[#DCE8DF] dark:bg-[#30463A] text-[#355E4A] dark:text-[#DCE8DF] flex items-center justify-center font-bold text-lg">
                      {project.name?.charAt(0)?.toUpperCase()}
                    </div>

                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#EEF3EF] dark:bg-[#30463A] text-[#355E4A] dark:text-[#DCE8DF]">
                      {item.role}
                    </span>

                  </div>

                  <h2 className="text-xl font-bold text-[#26352D] dark:text-[#F1F4ED] mt-5 group-hover:text-[#355E4A] dark:group-hover:text-[#6F9B82] transition">
                    {project.name}
                  </h2>

                  <p className="text-[#7B847E] dark:text-[#AAB5AE] text-sm leading-relaxed mt-2 line-clamp-3 min-h-[60px]">
                    {project.description || "No description provided."}
                  </p>

                  <div className="border-t border-[#EDF0EB] dark:border-[#344238] mt-6 pt-4 flex items-center justify-between">

                    <span className="text-sm text-[#7B847E] dark:text-[#AAB5AE]">
                      👥 {project.members}{" "}
                      {project.members === 1 ? "member" : "members"}
                    </span>

                    <span className="text-sm font-semibold text-[#355E4A] dark:text-[#6F9B82] group-hover:translate-x-1 transition-transform">
                      Open →
                    </span>

                  </div>

                </Link>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
};

export default Projects;