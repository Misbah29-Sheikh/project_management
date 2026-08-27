import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext";

const ProjectTasks = ({ projectId, projectRole }) => {
  const { showNotification } = useNotification();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState("todo");
  const [files, setFiles] = useState([]);

  const [members, setMembers] = useState([]);

  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const isAdmin =
    projectRole === "admin" ||
    projectRole === "project_admin";

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/tasks/${projectId}`);

      setTasks(response.data.data || []);
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Unable to fetch tasks.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await api.get(`/projects/${projectId}/members`);

      setMembers(response.data.data || []);
    } catch (error) {
      showNotification(
        error.response?.data?.message || "Unable to fetch project members.",
        "error"
      );
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchMembers();
  }, [projectId]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAssignedTo("");
    setStatus("todo");
    setFiles([]);
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    try {
      setCreateLoading(true);

      const formData = new FormData();

      formData.append("title", title);

      if (description) {
        formData.append("description", description);
      }

      if (assignedTo) {
        formData.append("assignedTo", assignedTo);
      }

      if (status) {
        formData.append("status", status);
      }

      files.forEach((file) => {
        formData.append("attachments", file);
      });

      const response = await api.post(
        `/tasks/${projectId}`,
        formData
      );

      await fetchTasks()

      resetForm();
      setShowCreateForm(false);

      showNotification(
        "Task created successfully.",
        "success"
      );
    } catch (error) {
      showNotification(
        error.response?.data?.message ||
        "Unable to create task.",
        "error"
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(taskId);

      await api.delete(
        `/tasks/${projectId}/t/${taskId}`
      );

      setTasks((prev) =>
        prev.filter((task) => task._id !== taskId)
      );

      showNotification(
        "Task deleted successfully.",
        "success"
      );
    } catch (error) {
      showNotification(
        error.response?.data?.message ||
        "Unable to delete task.",
        "error"
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  const getStatusStyle = (taskStatus) => {
    if (taskStatus === "done") {
      return "bg-[#DCE8DF] text-[#355E4A] dark:text-[#6F9B82]";
    }

    if (taskStatus === "in_progress") {
      return "bg-blue-50 text-blue-700";
    }

    return "bg-blue-50 dark:bg-[#243442] text-blue-700 dark:text-[#8DB4D6]";
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1F2A23] border border-[#E8E3D8] dark:border-[#344238] rounded-2xl p-6">
        <p className="text-[#72776F] dark:text-[#AAB5AE]">
          Loading tasks...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1F2A23] border border-[#E8E3D8] dark:border-[#344238] rounded-2xl p-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">

        <div>
          <h2 className="text-xl font-bold text-[#26352D] dark:text-[#F1F4ED]">
            Tasks
          </h2>

          <p className="text-sm text-[#72776F] dark:text-[#AAB5AE] mt-1">
            Manage tasks for this project.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setShowCreateForm((prev) => !prev);

              if (showCreateForm) {
                resetForm();
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-[#355E4A] text-white text-sm font-semibold hover:bg-[#2B4D3D] transition"
          >
            {showCreateForm
              ? "Cancel"
              : "+ Add Task"}
          </button>
        )}

      </div>

      {/* Create Task Form */}
      {showCreateForm && isAdmin && (
        <form
          onSubmit={handleCreateTask}
          className="border border-[#E8E3D8] dark:border-[#344238] bg-[#F7F4ED] dark:bg-[#2A382F] rounded-2xl p-5 mb-6"
        >

          <h3 className="text-lg font-semibold text-[#26352D] dark:text-[#F1F4ED] mb-5">
            Create Task
          </h3>

          <div className="space-y-4">

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-[#26352D] dark:text-[#F1F4ED] mb-2">
                Task Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Enter task title"
                required
                className="w-full border border-[#E8E3D8] dark:border-[#344238] rounded-xl px-4 py-3 bg-white dark:bg-[#1F2A23] text-[#26352D] dark:text-[#F1F4ED] outline-none focus:border-[#355E4A] focus:ring-2 focus:ring-[#DCE8DF]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-[#26352D] dark:text-[#F1F4ED] mb-2">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Enter task description"
                rows="4"
                className="w-full border border-[#E8E3D8] dark:border-[#344238] rounded-xl px-4 py-3 bg-white dark:bg-[#1F2A23] text-[#26352D] dark:text-[#F1F4ED] outline-none focus:border-[#355E4A] focus:ring-2 focus:ring-[#DCE8DF] resize-none"
              />
            </div>

            {/* Assignee + Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-semibold text-[#26352D] dark:text-[#F1F4ED] mb-2">
                  Assign To
                </label>

                <select
                  value={assignedTo}
                  onChange={(e) =>
                    setAssignedTo(e.target.value)
                  }
                  className="w-full border border-[#E8E3D8] dark:border-[#344238] rounded-xl px-4 py-3 bg-white dark:bg-[#1F2A23] text-[#26352D] dark:text-[#F1F4ED] outline-none focus:border-[#355E4A] focus:ring-2 focus:ring-[#DCE8DF]"
                >
                  <option value="">
                    Unassigned
                  </option>

                  {members.map((member) => (
                    <option
                      key={member.user?._id || member._id}
                      value={member.user?._id || member._id}
                    >
                      {member.user?.fullName ||
                        member.user?.username ||
                        member.fullName ||
                        member.username}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#26352D] dark:text-[#F1F4ED] mb-2">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                  className="w-full border border-[#E8E3D8] dark:border-[#344238] rounded-xl px-4 py-3 bg-white dark:bg-[#1F2A23] text-[#26352D] dark:text-[#F1F4ED] outline-none focus:border-[#355E4A] focus:ring-2 focus:ring-[#DCE8DF]"
                >
                  <option value="todo">
                    Todo
                  </option>

                  <option value="in_progress">
                    In Progress
                  </option>

                  <option value="done">
                    Done
                  </option>
                </select>
              </div>

            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-semibold text-[#26352D] dark:text-[#F1F4ED] mb-2">
                Attachments
              </label>

              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="w-full border border-[#E8E3D8] dark:border-[#344238] rounded-xl px-4 py-3 bg-white dark:bg-[#1F2A23] text-sm text-[#72776F] dark:text-[#AAB5AE]"
              />

              {files.length > 0 && (
                <div className="mt-3 space-y-1">
                  {files.map((file, index) => (
                    <p
                      key={`${file.name}-${index}`}
                      className="text-sm text-[#72776F] dark:text-[#AAB5AE]"
                    >
                      {file.name}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">

              <button
                type="submit"
                disabled={createLoading}
                className="px-5 py-2.5 rounded-xl bg-[#355E4A] text-white font-semibold hover:bg-[#2B4D3D] transition disabled:opacity-50"
              >
                {createLoading
                  ? "Creating..."
                  : "Create Task"}
              </button>

            </div>

          </div>
        </form>
      )}

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="border border-dashed border-[#E8E3D8] dark:border-[#344238] rounded-2xl p-8 text-center">
          <p className="text-[#72776F] dark:text-[#AAB5AE]">
            No tasks have been created for this project yet.
          </p>

          {isAdmin && (
            <button
              onClick={() =>
                setShowCreateForm(true)
              }
              className="mt-4 text-sm font-semibold text-[#355E4A] hover:text-[#2B4D3D] dark:hover:text-[#8CAF9A]"
            >
              Create the first task →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">

          {tasks.map((task) => (
            <div
              key={task._id}
              className="border border-[#E8E3D8] dark:border-[#344238] rounded-2xl p-5 hover:border-[#DCE8DF] dark:hover:border-[#355E4A] transition"
            >

              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                {/* Task information */}
                <div className="min-w-0 flex-1">

                  <Link
                    to={`/projects/${projectId}/tasks/${task._id}`}
                    className="text-lg font-semibold text-[#26352D] dark:text-[#F1F4ED] hover:text-[#355E4A] dark:hover:text-[#6F9B82] transition"
                  >
                    {task.title}
                  </Link>

                  <p className="text-sm text-[#72776F] dark:text-[#AAB5AE] mt-2 line-clamp-2">
                    {task.description ||
                      "No description provided."}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-4">

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>

                    <span className="text-sm text-[#72776F] dark:text-[#AAB5AE]">
                      {task.assignedTo
                        ? `Assigned to ${task.assignedTo.fullName ||
                        task.assignedTo.username
                        }`
                        : "Unassigned"}
                    </span>

                  </div>

                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">

                  <Link
                    to={`/projects/${projectId}/tasks/${task._id}`}
                    className="px-3 py-2 rounded-lg border border-[#E8E3D8] dark:border-[#344238] text-[#355E4A] dark:text-[#6F9B82] text-sm font-semibold hover:bg-[#F7F4ED] dark:hover:bg-[#2A382F] transition"
                  >
                    View
                  </Link>

                  {isAdmin && (<button
                    onClick={() =>
                      handleDeleteTask(task._id)
                    }
                    disabled={
                      deleteLoading === task._id
                    }
                    className="px-3 py-2 rounded-lg border border-red-200 dark:border-[#60413D] text-red-600 dark:text-[#D89A94] text-sm font-semibold hover:bg-red-50 dark:hover:bg-[#3A2927] transition disabled:opacity-50"
                  >
                    {deleteLoading === task._id
                      ? "Deleting..."
                      : "Delete"}
                  </button>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectTasks;