import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import ProjectMembers from "../components/ProjectMembers.jsx";
import ProjectTasks from "../components/ProjectTasks.jsx";
import { useNotification } from "../context/NotificationContext";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification()

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);

  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [noteActionLoading, setNoteActionLoading] = useState(false);

  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");

  const fetchNotes = async () => {
    try {
      setNotesLoading(true);

      const response = await api.get(
        `/notes/${projectId}`
      );

      setNotes(response.data.data || []);
    } catch (error) {
      showNotification(
        error.response?.data?.message ||
        "Unable to fetch project notes.",
        "error"
      );
    } finally {
      setNotesLoading(false);
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();

    if (!noteContent.trim()) {
      showNotification(
        "Note content is required.",
        "error"
      );
      return;
    }

    try {
      setNoteActionLoading(true);

      const response = await api.post(
        `/notes/${projectId}`,
        {
          content: noteContent,
        }
      );

      setNotes((prev) => [
        ...prev,
        response.data.data,
      ]);

      setNoteContent("");
      setShowNoteForm(false);

      showNotification(
        "Project note created successfully.",
        "success"
      );

      await fetchNotes();
    } catch (error) {
      showNotification(
        error.response?.data?.message ||
        "Unable to create project note.",
        "error"
      );
    } finally {
      setNoteActionLoading(false);
    }
  };

  const startEditingNote = (note) => {
    setEditingNoteId(note._id);
    setEditingNoteContent(note.content);
  };

  const cancelEditingNote = () => {
    setEditingNoteId(null);
    setEditingNoteContent("");
  };

  const handleUpdateNote = async (noteId) => {
    if (!editingNoteContent.trim()) {
      showNotification(
        "Note content is required.",
        "error"
      );
      return;
    }

    try {
      setNoteActionLoading(true);

      const response = await api.put(
        `/notes/${projectId}/n/${noteId}`,
        {
          content: editingNoteContent,
        }
      );

      setNotes((prev) =>
        prev.map((note) =>
          note._id === noteId
            ? {
              ...note,
              ...response.data.data,
            }
            : note
        )
      );

      cancelEditingNote();

      showNotification(
        "Project note updated successfully.",
        "success"
      );

      await fetchNotes();
    } catch (error) {
      showNotification(
        error.response?.data?.message ||
        "Unable to update project note.",
        "error"
      );
    } finally {
      setNoteActionLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setNoteActionLoading(true);

      await api.delete(
        `/notes/${projectId}/n/${noteId}`
      );

      setNotes((prev) =>
        prev.filter((note) => note._id !== noteId)
      );

      showNotification(
        "Project note deleted successfully.",
        "success"
      );
    } catch (error) {
      showNotification(
        error.response?.data?.message ||
        "Unable to delete project note.",
        "error"
      );
    } finally {
      setNoteActionLoading(false);
    }
  };

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/projects/${projectId}`);

        const projectData = response.data.data;

        setProject(projectData);
        setName(projectData.name);
        setDescription(projectData.description || "");
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Unable to fetch project details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
    fetchNotes();
  }, [projectId]);

  const handleEdit = () => {
    setName(project.name);
    setDescription(project.description || "");
    setEditing(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      setUpdateLoading(true);

      const response = await api.put(
        `/projects/${projectId}`,
        {
          name,
          description,
        }
      );

      setProject(response.data.data);
      setEditing(false);
      showNotification(
        "Project updated successfully.",
        "success"
      )
    } catch (error) {
      showNotification(error, "error");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancel = () => {
    setName(project.name);
    setDescription(project.description || "");
    setEditing(false);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(true);

      await api.delete(`/projects/${projectId}`);

      navigate("/projects");
    } catch (error) {
      showNotification(error, "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#72776F] dark:text-[#AAB5AE]">Loading project...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <div className="bg-red-50 dark:bg-[#3A2927] border border-red-200 dark:border-[#60413D] text-red-700 dark:text-[#D89A94] p-4 rounded-xl">
          {error}
        </div>

        <Link
          to="/projects"
          className="inline-flex items-center text-sm font-semibold text-[#355E4A] dark:text-[#6F9B82] hover:text-[#2B4D3D] dark:hover:text-[#8CAF9A] mb-6"
        >
          ← Back to Projects
        </Link>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Back */}
      <Link
        to="/projects"
        className="inline-flex items-center text-sm font-semibold text-[#355E4A] dark:text-[#6F9B82] hover:text-[#2B4D3D] dark:hover:text-[#8CAF9A] mb-6"
      >
        ← Back to Projects
      </Link>

      {/* Header */}
      <div className="bg-white dark:bg-[#1F2A23] border border-[#E8E3D8] dark:border-[#344238] rounded-2xl p-7 mb-6">
        <div className="flex items-start justify-between gap-6">

          <div className="flex-1">

            <p className="text-sm font-semibold text-[#355E4A] dark:text-[#6F9B82] mb-2">
              Project
            </p>

            {!editing ? (
              <>
                <h1 className="text-3xl font-bold text-[#26352D] dark:text-[#F1F4ED]">
                  {project.name}
                </h1>

                <p className="text-[#72776F] dark:text-[#AAB5AE] mt-3 leading-relaxed">
                  {project.description || "No description provided."}
                </p>
              </>
            ) : (
              <form
                onSubmit={handleUpdate}
                className="mt-3 space-y-5"
              >
                <div>
                  <label className="block text-sm font-semibold text-[#26352D] dark:text-[#F1F4ED] mb-2">
                    Project Name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full border border-[#E8E3D8] dark:border-[#344238] rounded-xl px-4 py-3 bg-[#F7F4ED] dark:bg-[#2A382F] text-[#26352D] dark:text-[#F1F4ED] outline-none focus:border-[#355E4A] focus:ring-2 focus:ring-[#DCE8DF]"
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
                    className="w-full border border-[#E8E3D8] dark:border-[#344238] rounded-xl px-4 py-3 bg-white dark:bg-[#1F2A23] text-[#26352D] dark:text-[#F1F4ED] outline-none focus:border-[#355E4A] focus:ring-2 focus:ring-[#DCE8DF] resize-none" />
                </div>


                <div className="flex gap-3">

                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="px-5 py-2.5 rounded-xl bg-[#355E4A] text-white font-semibold hover:bg-[#2B4D3D] transition disabled:opacity-50"
                  >
                    {updateLoading
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-5 py-2.5 rounded-xl border border-[#E8E3D8] text-[#355E4A] dark:text-[#6F9B82] font-semibold hover:bg-[#F7F4ED] dark:hover:bg-[#2A382F] transition"
                  >
                    Cancel
                  </button>

                </div>
              </form>
            )}

          </div>

          {!editing && project.role === "admin" && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleEdit}
                className="px-4 py-2 rounded-xl bg-[#355E4A] text-white text-sm font-semibold hover:bg-[#2B4D3D] transition"
              >
                Edit Project
              </button>

              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl border border-red-200 dark:border-[#60413D] text-red-600 dark:text-[#D89A94] text-sm font-semibold hover:bg-red-50 dark:hover:bg-[#3A2927] transition disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Project Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div className="bg-white dark:bg-[#1F2A23] border border-[#E8E3D8] dark:border-[#344238] rounded-2xl p-6">
          <p className="text-sm text-[#72776F] dark:text-[#AAB5AE]">
            Created
          </p>

          <p className="text-lg font-semibold text-[#26352D] dark:text-[#F1F4ED] mt-2">
            {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white dark:bg-[#1F2A23] border border-[#E8E3D8] dark:border-[#344238] rounded-2xl p-6">
          <p className="text-sm text-[#72776F] dark:text-[#AAB5AE]">
            Created By
          </p>

          <p className="text-lg font-semibold text-[#26352D] dark:text-[#F1F4ED] mt-2">
            {project.createdBy?.fullName ||
              project.createdBy?.username}
          </p>
        </div>

      </div>

      {/* Project Members */}
      <div className="mt-6">
        <ProjectMembers projectId={projectId} />
      </div>

      {/* roject Tasks */}
      <div className="mt-6">
        <ProjectTasks
          projectId={projectId}
          projectRole={project.role} />
      </div>

      {/* Project Notes */}
      <div className="bg-white dark:bg-[#1F2A23] border border-[#E8E3D8] dark:border-[#344238] rounded-2xl p-6 mt-6">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>
            <h2 className="text-lg font-semibold text-[#26352D] dark:text-[#F1F4ED]">
              Project Notes
            </h2>

            <p className="text-sm text-[#72776F] dark:text-[#AAB5AE] mt-1">
              Important information and discussions related to this project.
            </p>
          </div>

          {project.role === "admin" && (
            <button
              onClick={() =>
                setShowNoteForm((prev) => !prev)
              }
              className="px-4 py-2 rounded-xl bg-[#355E4A] text-white text-sm font-semibold hover:bg-[#2B4D3D] transition"
            >
              {showNoteForm
                ? "Cancel"
                : "+ Add Note"}
            </button>
          )}

        </div>

        {/* Create Note Form */}
        {showNoteForm && project.role === "admin" && (
          <form
            onSubmit={handleCreateNote}
            className="mt-5 border border-[#E8E3D8] dark:border-[#344238] bg-[#F7F4ED] dark:bg-[#2A382F] rounded-2xl p-5"
          >

            <label className="block text-sm font-semibold text-[#26352D] dark:text-[#F1F4ED] mb-2">
              Note
            </label>

            <textarea
              value={noteContent}
              onChange={(e) =>
                setNoteContent(e.target.value)
              }
              rows="4"
              placeholder="Write a project note..."
              className="w-full border border-[#E8E3D8] dark:border-[#344238] rounded-xl px-4 py-3 bg-[#F7F4ED] dark:bg-[#2A382F] text-[#26352D] dark:text-[#F1F4ED] outline-none focus:border-[#355E4A] focus:ring-2 focus:ring-[#DCE8DF] resize-none"
            />

            <div className="flex justify-end mt-3">

              <button
                type="submit"
                disabled={noteActionLoading}
                className="px-5 py-2.5 rounded-xl bg-[#355E4A] text-white text-sm font-semibold hover:bg-[#2B4D3D] transition disabled:opacity-50"
              >
                {noteActionLoading
                  ? "Adding..."
                  : "Add Note"}
              </button>

            </div>

          </form>
        )}

        {/* Notes List */}
        {notesLoading ? (
          <p className="text-sm text-[#72776F] dark:text-[#AAB5AE] mt-5">
            Loading notes...
          </p>
        ) : notes.length > 0 ? (

          <div className="mt-5 space-y-4">

            {notes.map((note) => (

              <div
                key={note._id}
                className="border border-[#E8E3D8] dark:border-[#344238] rounded-xl p-5"
              >

                {editingNoteId === note._id ? (

                  <div>

                    <textarea
                      value={editingNoteContent}
                      onChange={(e) =>
                        setEditingNoteContent(e.target.value)
                      }
                      rows="4"
                      className="w-full border border-[#E8E3D8] dark:border-[#344238] rounded-xl px-4 py-3 bg-[#F7F4ED] dark:bg-[#2A382F] text-[#26352D] dark:text-[#F1F4ED] outline-none focus:border-[#355E4A] focus:ring-2 focus:ring-[#DCE8DF] resize-none"
                    />

                    <div className="flex gap-2 mt-3">

                      <button
                        onClick={() =>
                          handleUpdateNote(note._id)
                        }
                        disabled={noteActionLoading}
                        className="px-4 py-2 rounded-lg bg-[#355E4A] text-white text-sm font-semibold hover:bg-[#2B4D3D] disabled:opacity-50"
                      >
                        {noteActionLoading
                          ? "Saving..."
                          : "Save"}
                      </button>

                      <button
                        type="button"
                        onClick={cancelEditingNote}
                        disabled={noteActionLoading}
                        className="px-4 py-2 rounded-lg border border-[#E8E3D8] text-[#355E4A] dark:text-[#6F9B82] text-sm font-semibold hover:bg-[#F7F4ED] dark:hover:bg-[#2A382F] dark:border-[#344238]"
                      >
                        Cancel
                      </button>

                    </div>

                  </div>

                ) : (

                  <>
                    <p className="text-[#26352D] dark:text-[#F1F4ED] leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t border-[#E8E3D8] dark:border-[#344238]">

                      <div>

                        <p className="text-xs text-[#72776F] dark:text-[#AAB5AE]">
                          Created by{" "}
                          <span className="font-semibold text-[#566159] dark:text-[#C2CCC5]">
                            {note.createdBy?.fullName ||
                              note.createdBy?.username ||
                              "Unknown"}
                          </span>
                        </p>

                        <p className="text-xs text-[#9AA19B] dark:text-[#7F8D84] mt-1">
                          {new Date(
                            note.createdAt
                          ).toLocaleString()}
                        </p>

                      </div>

                      {project.role === "admin" && (
                        <div className="flex gap-2">

                          <button
                            onClick={() =>
                              startEditingNote(note)
                            }
                            className="px-3 py-2 rounded-lg border border-[#E8E3D8] dark:border-[#344238] text-[#355E4A] dark:text-[#6F9B82] text-xs font-semibold hover:bg-[#F7F4ED] dark:hover:bg-[#2A382F]"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDeleteNote(note._id)
                            }
                            disabled={noteActionLoading}
                            className="px-3 py-2 rounded-lg border border-red-200 dark:border-[#60413D] text-red-600 dark:text-[#D89A94] text-xs font-semibold hover:bg-red-50 dark:hover:bg-[#3A2927] disabled:opacity-50"
                          >
                            Delete
                          </button>

                        </div>
                      )}

                    </div>
                  </>

                )}

              </div>

            ))}

          </div>

        ) : (

          <p className="text-sm text-[#72776F] dark:text-[#AAB5AE] mt-5">
            No project notes yet.
          </p>

        )}

      </div>

    </div>
  );
};

export default ProjectDetails;