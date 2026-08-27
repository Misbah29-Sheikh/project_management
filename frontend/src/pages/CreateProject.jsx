import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext";

const CreateProject = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await api.post("/projects", {
        name,
        description,
      });

      showNotification(
        "Project created successfully.",
        "success"
      );

      navigate("/projects");
    } catch (error) {
      showNotification(error, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-5 sm:px-8 lg:px-10 py-8">
      <div className="max-w-3xl mx-auto">

        {/* Heading */}
        <div className="mb-8">
          <p className="text-sm font-medium text-[#6B746D] dark:text-[#AAB5AE] mb-2">
            Projects
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-[#26352D] dark:text-[#F1F4ED]">
            Create a new project
          </h1>

          <p className="text-[#7B847E] dark:text-[#AAB5AE] mt-2">
            Set up your project and start collaborating with your team.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-[#1F2A23] border border-[#E8E3D8] dark:border-[#344238] rounded-2xl p-6 sm:p-8">

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-[#3E4842] dark:text-[#F1F4ED] mb-2">
                Project name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hotel Management System"
                required
                className="w-full border border-[#E8E3D8] dark:border-[#344238] rounded-xl px-4 py-3.5 bg-[#F7F4ED] dark:bg-[#2A382F] text-[#26352D] dark:text-[#F1F4ED] placeholder:text-[#72776F] dark:placeholder:text-[#AAB5AE] outline-none focus:border-[#355E4A] focus:ring-2 focus:ring-[#DCE8DF]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-[#3E4842] dark:text-[#F1F4ED] mb-2">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what this project is about..."
                rows={6}
                className="w-full border border-[#E8E3D8] dark:border-[#344238] rounded-xl px-4 py-3.5 bg-[#F7F4ED] dark:bg-[#2A382F] text-[#26352D] dark:text-[#F1F4ED] placeholder:text-[#72776F] dark:placeholder:text-[#AAB5AE] outline-none focus:border-[#355E4A] focus:ring-2 focus:ring-[#DCE8DF] resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-3 border-t border-[#E8E3D8] dark:border-[#344238]">

              <button
                type="button"
                onClick={() => navigate("/projects")}
                className="px-5 py-3 rounded-xl border border-[#D8DED8] dark:border-[#344238] text-[#566159] dark:text-[#AAB5AE] font-semibold hover:bg-[#F7F4ED] dark:hover:bg-[#2A382F] transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-[#355E4A] text-white font-semibold hover:bg-[#2B4D3D] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Project"}
              </button>

            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;