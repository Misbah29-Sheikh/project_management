import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";

const TaskDetails = () => {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();

  const { showNotification } = useNotification();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [editing, setEditing] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState("todo");
  const [files, setFiles] = useState([]);

  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [subtaskLoading, setSubtaskLoading] = useState(false);

  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState("");

  const [subtaskActionLoading, setSubtaskActionLoading] =
    useState(null);
  const [projectRole, setProjectRole] = useState(null);

  const isAdmin =
    user?.role === "admin" ||
    projectRole === "admin" ||
    projectRole === "project_admin";

  const fetchTask = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/tasks/${projectId}/t/${taskId}`
      );

      const taskData = response.data.data;

      setTask(taskData);

      setTitle(taskData.title || "");
      setDescription(taskData.description || "");
      setAssignedTo(taskData.assignedTo?._id || "");
      setStatus(taskData.status || "todo");
    } catch (error) {
      showNotification(
        error.response?.data?.message ||
        "Unable to fetch task details.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectMembers = async () => {
    try {
      const response = await api.get(
        `/projects/${projectId}/members`
      );

      const membersData = response.data.data || [];

      setMembers(membersData);

      const currentMember = membersData.find(
        (member) => member.user?._id === user?._id
      );

      setProjectRole(currentMember?.role || null);
    } catch (error) {
      showNotification(
        error.response?.data?.message ||
        "Unable to fetch project members.",
        "error"
      );
    }
  };

  useEffect(() => {
    fetchTask();
    fetchProjectMembers();
  }, [projectId, taskId]);

  const getStatusStyle = (status) => {
    if (status === "done") {
      return "bg-[#DCE8DF] dark:bg-[#355E4A] text-[#355E4A] dark:text-[#DCE8DF]";
    }

    if (status === "in_progress") {
      return "bg-blue-50 text-blue-700";
    }

    return "bg-[#F7F4ED] dark:bg-[#2A382F] text-[#72776F] dark:text-[#AAB5AE]";
  };

  const getStatusLabel = (status) => {
    if (status === "in_progress") {
      return "In Progress";
    }

    if (status === "done") {
      return "Done";
    }

    return "Todo";
  };

  const startEditing = () => {
    setTitle(task.title || "");
    setDescription(task.description || "");
    setAssignedTo(task.assignedTo?._id || "");
    setStatus(task.status || "todo");
    setFiles([]);

    setEditing(true);
  };

  const cancelEditing = () => {
    setTitle(task.title || "");
    setDescription(task.description || "");
    setAssignedTo(task.assignedTo?._id || "");
    setStatus(task.status || "todo");
    setFiles([]);

    setEditing(false);
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();

    try {
      setEditLoading(true);

      const formData = new FormData();

      formData.append("title", title);

      formData.append("description", description);

      if (assignedTo) {
        formData.append("assignedTo", assignedTo);
      }

      formData.append("status", status);

      files.forEach((file) => {
        formData.append("attachments", file);
      });

      const response = await api.put(
        `/tasks/${projectId}/t/${taskId}`,
        formData
      );

      setTask((prev) => ({
        ...prev,
        ...response.data.data,
      }));

      setEditing(false);
      setFiles([]);

      showNotification(
        "Task updated successfully.",
        "success"
      );

      await fetchTask();
    } catch (error) {
      showNotification(
        error.response?.data?.message ||
        "Unable to update task.",
        "error"
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(true);

      await api.delete(
        `/tasks/${projectId}/t/${taskId}`
      );

      showNotification(
        "Task deleted successfully.",
        "success"
      );

      navigate(`/projects/${projectId}`);
    } catch (error) {
      showNotification(
        error.response?.data?.message ||
        "Unable to delete task.",
        "error"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCreateSubtask = async (e) => {
    e.preventDefault();

    if (!subtaskTitle.trim()) {
      showNotification(
        "Subtask title is required.",
        "error"
      );
      return;
    }

    try {
      setSubtaskLoading(true);

      const response = await api.post(
        `/tasks/${projectId}/t/${taskId}/subtasks`,
        {
          title: subtaskTitle,
        }
      );

      setTask((prev) => ({
        ...prev,
        subtasks: [
          ...(prev.subtasks || []),
          response.data.data,
        ],
      }));

      setSubtaskTitle("");
      setShowSubtaskForm(false);

      showNotification(
        "Subtask created successfully.",
        "success"
      );

      await fetchTask();
    } catch (error) {
      showNotification(
        error.response?.data?.message ||
        "Unable to create subtask.",
        "error"
      );
    } finally {
      setSubtaskLoading(false);
    }
  };

  const startEditingSubtask = (subtask) => {
    setEditingSubtaskId(subtask._id);
    setEditingSubtaskTitle(subtask.title);
  };

  const cancelEditingSubtask = () => {
    setEditingSubtaskId(null);
    setEditingSubtaskTitle("");
  };

  const handleUpdateSubtask = async (subtask) => {
    if (!editingSubtaskTitle.trim()) {
      showNotification(
        "Subtask title cannot be empty.",
        "error"
      );
      return;
    }

    try {
      setSubtaskActionLoading(subtask._id);

      const response = await api.put(
        `/tasks/${projectId}/st/${subtask._id}`,
        {
          title: editingSubtaskTitle,
          isCompleted: subtask.isCompleted,
        }
      );

      setTask((prev) => ({
        ...prev,
        subtasks: prev.subtasks.map((item) =>
          item._id === subtask._id
            ? {
              ...item,
              ...response.data.data,
            }
            : item
        ),
      }));

      cancelEditingSubtask();

      showNotification(
        "Subtask updated successfully.",
        "success"
      );

      await fetchTask();
    } catch (error) {
      showNotification(
        error.response?.data?.message ||
        "Unable to update subtask.",
        "error"
      );
    } finally {
      setSubtaskActionLoading(null);
    }
  };

  const handleToggleSubtask = async (subtask) => {
    try {
      setSubtaskActionLoading(subtask._id);

      const response = await api.put(
        `/tasks/${projectId}/st/${subtask._id}`,
        {
          isCompleted: !subtask.isCompleted,
        }
      );

      setTask((prev) => ({
        ...prev,
        subtasks: prev.subtasks.map((item) =>
          item._id === subtask._id
            ? {
              ...item,
              ...response.data.data,
            }
            : item
        ),
      }));
    } catch (error) {
      showNotification(
        error.response?.data?.message ||
        "Unable to update subtask.",
        "error"
      );
    } finally {
      setSubtaskActionLoading(null);
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this subtask?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setSubtaskActionLoading(subtaskId);

      await api.delete(
        `/tasks/${projectId}/st/${subtaskId}`
      );

      setTask((prev) => ({
        ...prev,
        subtasks: prev.subtasks.filter(
          (item) => item._id !== subtaskId
        ),
      }));

      showNotification(
        "Subtask deleted successfully.",
        "success"
      );
    } catch (error) {
      showNotification(
        error.response?.data?.message ||
        "Unable to delete subtask.",
        "error"
      );
    } finally {
      setSubtaskActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-white dark:bg-[#1F2A23] border border-[#E8E3D8] dark:border-[#344238] rounded-2xl p-6">
          <p className="text-[#72776F] dark:text-[#AAB5AE]">
            Loading task...
          </p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-5xl mx-auto mt-10">
        <div className="bg-red-50 dark:bg-[#3A2927] border border-red-200 dark:border-[#60413D] text-red-700 dark:text-[#D89A94] p-4 rounded-xl">
          Task not found.
        </div>

        <Link
          to={`/projects/${projectId}`}
          className="inline-block mt-5 text-sm font-semibold text-[#355E4A] dark:text-[#6F9B82] hover:text-[#2B4D3D] dark:hover:text-[#8CAF9A]"
        >
          ← Back to Project
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Back */}
      <Link
        to={`/projects/${projectId}`}
        className="inline-flex items-center text-sm font-semibold text-[#355E4A] dark:text-[#6F9B82] hover:text-[#2B4D3D] dark:hover:text-[#8CAF9A] mb-6"
      >
        ← Back to Project
      </Link>

      {/* Header */}
      <div className="bg-white dark:bg-[#1F2A23] border border-[#E8E3D8] dark:border-[#344238] rounded-2xl p-7 mb-6">

        {!editing ? (
          <div className="flex items-start justify-between gap-6">

            <div className="min-w-0 flex-1">

              <p className="text-sm font-semibold text-[#355E4A] dark:text-[#6F9B82] mb-2">
                Task
              </p>

              <h1 className="text-3xl font-bold text-[#26352D] dark:text-[#F1F4ED]">
                {task.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mt-4">

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                    task.status
                  )}`}
                >
                  {getStatusLabel(task.status)}
                </span>

                <span className="text-sm text-[#72776F] dark:text-[#AAB5AE]">
                  Created{" "}
                  {new Date(
                    task.createdAt
                  ).toLocaleDateString()}
                </span>

              </div>

            </div>

            {isAdmin && (
              <div className="flex items-center gap-3">

                <button
                  onClick={startEditing}
                  className="px-4 py-2 rounded-xl bg-[#355E4A] text-white text-sm font-semibold hover:bg-[#2B4D3D] transition"
                >
                  Edit
                </button>

                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 rounded-xl border border-red-200 dark:border-[#60413D] text-red-600 dark:text-[#D89A94] text-sm font-semibold hover:bg-red-50 dark:hover:bg-[#3A2927] transition disabled:opacity-50"
                >
                  {deleteLoading
                    ? "Deleting..."
                    : "Delete"}
                </button>

              </div>
            )}

          </div>
        ) : (
          <form
            onSubmit={handleUpdateTask}
            className="space-y-5"
          >

            <div>
              <p className="text-sm font-semibold text-[#355E4A] dark:text-[#6F9B82] mb-2">
                Edit Task
              </p>

              <label className="block text-sm font-semibold text-[#26352D] dark:text-[#F1F4ED] mb-2">
                Task Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                required
                className="w-full border border-[#E8E3D8] dark:border-[#344238] rounded-xl px-4 py-3 bg-[#F7F4ED] dark:bg-[#2A382F] text-[#26352D] dark:text-[#F1F4ED] outline-none focus:border-[#355E4A] focus:ring-2 focus:ring-[#DCE8DF] dark:focus:border-[#6F9B82] dark:focus:ring-[#355E4A]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#26352D] dark:text-[#F1F4ED] mb-2">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                rows="4"
                className="w-full border border-[#E8E3D8] dark:border-[#344238] rounded-xl px-4 py-3 bg-[#F7F4ED] dark:bg-[#2A382F] text-[#26352D] dark:text-[#F1F4ED] outline-none focus:border-[#355E4A] focus:ring-2 focus:ring-[#DCE8DF] dark:focus:border-[#6F9B82] dark:focus:ring-[#355E4A] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-semibold text-[#26352D] dark:text-[#F1F4ED] mb-2">
                  Assigned To
                </label>

                <select
                  value={assignedTo}
                  onChange={(e) =>
                    setAssignedTo(e.target.value)
                  }
                  className="w-full border border-[#E8E3D8] dark:border-[#344238] rounded-xl px-4 py-3 bg-[#F7F4ED] dark:bg-[#2A382F] text-[#26352D] dark:text-[#F1F4ED] outline-none focus:border-[#355E4A] focus:ring-2 focus:ring-[#DCE8DF] dark:focus:border-[#6F9B82] dark:focus:ring-[#355E4A]"
                >
                  <option value="">
                    Unassigned
                  </option>

                  {members.map((member) => {
                    const memberUser =
                      member.user || member;

                    return (
                      <option
                        key={memberUser._id}
                        value={memberUser._id}
                      >
                        {memberUser.fullName ||
                          memberUser.username}
                      </option>
                    );
                  })}
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
                  className="w-full border border-[#E8E3D8] dark:border-[#344238] rounded-xl px-4 py-3 bg-[#F7F4ED] dark:bg-[#2A382F] text-[#26352D] dark:text-[#F1F4ED] outline-none focus:border-[#355E4A] focus:ring-2 focus:ring-[#DCE8DF] dark:focus:border-[#6F9B82] dark:focus:ring-[#355E4A]"
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

            <div>
              <label className="block text-sm font-semibold text-[#26352D] dark:text-[#F1F4ED] mb-2">
                Replace Attachments
              </label>

              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="w-full border border-[#E8E3D8] dark:border-[#344238] rounded-xl px-4 py-3 bg-[#F7F4ED] dark:bg-[#2A382F] text-sm text-[#72776F] dark:text-[#AAB5AE]"
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

            <div className="flex gap-3">

              <button
                type="submit"
                disabled={editLoading}
                className="px-5 py-2.5 rounded-xl bg-[#355E4A] text-white font-semibold hover:bg-[#2B4D3D] transition disabled:opacity-50"
              >
                {editLoading
                  ? "Saving..."
                  : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={cancelEditing}
                className="px-5 py-2.5 rounded-xl border border-[#E8E3D8] dark:border-[#344238] text-[#355E4A] dark:text-[#6F9B82] font-semibold hover:bg-[#F7F4ED] dark:hover:bg-[#2A382F] transition"
              >
                Cancel
              </button>

            </div>

          </form>
        )}

      </div>

      {/* Task Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Description */}
        <div className="bg-white dark:bg-[#1F2A23] border border-[#E8E3D8] dark:border-[#344238] rounded-2xl p-6">

          <h2 className="text-lg font-semibold text-[#26352D] dark:text-[#F1F4ED]">
            Description
          </h2>

          <p className="text-[#72776F] dark:text-[#AAB5AE] mt-3 leading-relaxed whitespace-pre-wrap">
            {task.description ||
              "No description provided."}
          </p>

        </div>

        {/* Assignment */}
        <div className="bg-white dark:bg-[#1F2A23] border border-[#E8E3D8] dark:border-[#344238] rounded-2xl p-6">

          <h2 className="text-lg font-semibold text-[#26352D] dark:text-[#F1F4ED]">
            Assignment
          </h2>

          <div className="mt-4 space-y-4">

            <div>
              <p className="text-sm text-[#72776F] dark:text-[#AAB5AE]">
                Assigned To
              </p>

              <p className="font-semibold text-[#26352D] dark:text-[#F1F4ED] mt-1">
                {task.assignedTo?.fullName ||
                  task.assignedTo?.username ||
                  "Unassigned"}
              </p>
            </div>

            <div>
              <p className="text-sm text-[#72776F] dark:text-[#AAB5AE]">
                Assigned By
              </p>

              <p className="font-semibold text-[#26352D] dark:text-[#F1F4ED] mt-1">
                {task.assignedBy?.fullName ||
                  task.assignedBy?.username ||
                  "Not available"}
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Attachments */}
      <div className="bg-white dark:bg-[#1F2A23] border border-[#E8E3D8] dark:border-[#344238] rounded-2xl p-6 mt-6">

        <h2 className="text-lg font-semibold text-[#26352D] dark:text-[#F1F4ED]">
          Attachments
        </h2>

        {task.attachments?.length > 0 ? (
          <div className="mt-4 space-y-3">

            {task.attachments.map(
              (attachment, index) => (
                <a
                  key={`${attachment.url}-${index}`}
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-4 border border-[#E8E3D8] dark:border-[#344238] rounded-xl px-4 py-3 hover:bg-[#F7F4ED] dark:hover:bg-[#2A382F] transition"
                >

                  <div className="min-w-0">

                    <p className="text-sm font-semibold text-[#26352D] dark:text-[#F1F4ED] truncate">
                      {attachment.url
                        ?.split("/")
                        .pop()}
                    </p>

                    <p className="text-xs text-[#72776F] dark:text-[#AAB5AE] mt-1">
                      {attachment.mimetype} ·{" "}
                      {Math.ceil(
                        attachment.size / 1024
                      )} KB
                    </p>

                  </div>

                  <span className="text-sm font-semibold text-[#355E4A] dark:text-[#6F9B82]">
                    Open
                  </span>

                </a>
              )
            )}

          </div>
        ) : (
          <p className="text-sm text-[#72776F] dark:text-[#AAB5AE] mt-3">
            No attachments.
          </p>
        )}

      </div>

      {/* Subtasks */}
      <div className="bg-white dark:bg-[#1F2A23] border border-[#E8E3D8] dark:border-[#344238] rounded-2xl p-6 mt-6">

        <div className="flex items-center justify-between gap-4">

          <div>
            <h2 className="text-lg font-semibold text-[#26352D] dark:text-[#F1F4ED]">
              Subtasks
            </h2>

            <p className="text-sm text-[#72776F] dark:text-[#AAB5AE] mt-1">
              Break this task into smaller steps.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() =>
                setShowSubtaskForm((prev) => !prev)
              }
              className="px-4 py-2 rounded-xl bg-[#355E4A] text-white text-sm font-semibold hover:bg-[#2B4D3D] transition"
            >
              {showSubtaskForm
                ? "Cancel"
                : "+ Add Subtask"}
            </button>
          )}

        </div>

        {/* Create Subtask Form */}
        {showSubtaskForm && isAdmin && (
          <form
            onSubmit={handleCreateSubtask}
            className="mt-5 border border-[#E8E3D8] dark:border-[#344238] bg-[#F7F4ED] dark:bg-[#2A382F] rounded-2xl p-5"
          >

            <label className="block text-sm font-semibold text-[#26352D] dark:text-[#F1F4ED] mb-2">
              Subtask Title
            </label>

            <div className="flex flex-col sm:flex-row gap-3">

              <input
                type="text"
                value={subtaskTitle}
                onChange={(e) =>
                  setSubtaskTitle(e.target.value)
                }
                placeholder="Enter subtask title"
                className="flex-1 border border-[#E8E3D8] dark:border-[#344238] rounded-xl px-4 py-3 bg-white dark:bg-[#1F2A23] text-[#26352D] dark:text-[#F1F4ED] outline-none focus:border-[#355E4A] focus:ring-2 focus:ring-[#DCE8DF] dark:focus:border-[#6F9B82] dark:focus:ring-[#355E4A]"
              />

              <button
                type="submit"
                disabled={subtaskLoading}
                className="px-5 py-3 rounded-xl bg-[#355E4A] text-white font-semibold hover:bg-[#2B4D3D] transition disabled:opacity-50"
              >
                {subtaskLoading
                  ? "Adding..."
                  : "Add"}
              </button>

            </div>

          </form>
        )}

        {/* Subtask List */}
        {task.subtasks?.length > 0 ? (
          <div className="mt-5 space-y-3">

            {task.subtasks.map((subtask) => {

              const actionLoading =
                subtaskActionLoading === subtask._id;

              return (
                <div
                  key={subtask._id}
                  className="border border-[#E8E3D8] dark:border-[#344238] rounded-xl p-4"
                >

                  {editingSubtaskId === subtask._id ? (

                    <div className="flex flex-col gap-3">

                      <input
                        type="text"
                        value={editingSubtaskTitle}
                        onChange={(e) =>
                          setEditingSubtaskTitle(
                            e.target.value
                          )
                        }
                        className="w-full border border-[#E8E3D8] dark:border-[#344238] rounded-xl px-4 py-3 bg-[#F7F4ED] dark:bg-[#2A382F] text-[#26352D] dark:text-[#F1F4ED] outline-none focus:border-[#355E4A] focus:ring-2 focus:ring-[#DCE8DF] dark:focus:border-[#6F9B82] dark:focus:ring-[#355E4A]"
                      />

                      <div className="flex gap-2">

                        <button
                          onClick={() =>
                            handleUpdateSubtask(
                              subtask
                            )
                          }
                          disabled={actionLoading}
                          className="px-4 py-2 rounded-lg bg-[#355E4A] text-white text-sm font-semibold hover:bg-[#2B4D3D] disabled:opacity-50"
                        >
                          {actionLoading
                            ? "Saving..."
                            : "Save"}
                        </button>

                        <button
                          onClick={
                            cancelEditingSubtask
                          }
                          className="px-4 py-2 rounded-lg border border-[#E8E3D8] dark:border-[#344238] text-[#355E4A] dark:text-[#6F9B82] text-sm font-semibold hover:bg-[#F7F4ED] dark:hover:bg-[#2A382F]"
                        >
                          Cancel
                        </button>

                      </div>

                    </div>

                  ) : (

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                      <div className="min-w-0">

                        <p
                          className={`font-semibold ${subtask.isCompleted
                            ? "text-[#72776F] dark:text-[#AAB5AE] line-through"
                            : "text-[#26352D] dark:text-[#F1F4ED]"
                            }`}
                        >
                          {subtask.title}
                        </p>

                        <p className="text-xs text-[#72776F] dark:text-[#AAB5AE] mt-1">
                          Created by{" "}
                          {subtask.createdBy?.fullName ||
                            subtask.createdBy?.username ||
                            "Unknown"}
                        </p>

                      </div>

                      <div className="flex flex-wrap items-center gap-2">

                        <button
                          onClick={() =>
                            handleToggleSubtask(
                              subtask
                            )
                          }
                          disabled={actionLoading}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold ${subtask.isCompleted
                            ? "bg-[#F7F4ED] dark:bg-[#2A382F] text-[#72776F] dark:text-[#AAB5AE]"
                            : "bg-[#DCE8DF] dark:bg-[#355E4A] text-[#355E4A] dark:text-[#DCE8DF]"
                            } disabled:opacity-50`}
                        >
                          {subtask.isCompleted
                            ? "Mark Pending"
                            : "Mark Complete"}
                        </button>

                        {isAdmin && (
                          <>
                            <button
                              onClick={() =>
                                startEditingSubtask(
                                  subtask
                                )
                              }
                              className="px-3 py-2 rounded-lg border border-[#E8E3D8] dark:border-[#344238] text-[#355E4A] dark:text-[#6F9B82] text-xs font-semibold hover:bg-[#F7F4ED] dark:hover:bg-[#2A382F]"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                handleDeleteSubtask(
                                  subtask._id
                                )
                              }
                              disabled={actionLoading}
                              className="px-3 py-2 rounded-lg border border-red-200 dark:border-[#60413D] text-red-600 dark:text-[#D89A94] text-xs font-semibold hover:bg-red-50 dark:hover:bg-[#3A2927] disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </>
                        )}

                      </div>

                    </div>

                  )}

                </div>
              );
            })}

          </div>
        ) : (
          <p className="text-sm text-[#72776F] dark:text-[#AAB5AE] mt-5">
            No subtasks yet.
          </p>
        )}

      </div>

    </div>
  );
};

export default TaskDetails;