import { useEffect, useState } from "react";
import api from "../services/api";
import { useNotification } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";

const ProjectMembers = ({ projectId }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddMember, setShowAddMember] = useState(false);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [role, setRole] = useState("member");

  const [editingUserId, setEditingUserId] = useState(null);
  const [editingRole, setEditingRole] = useState("");

  const [leaveLoading, setLeaveLoading] = useState(false);

  const { user } = useAuth();
  const { showNotification } = useNotification();

  const currentMember = members.find(
    (member) => member.user._id === user?._id
  );

  const isAdmin = currentMember?.role === "admin";

  const adminCount = members.filter(
    (member) => member.role === "admin"
  ).length;

  const isOnlyAdmin = isAdmin && adminCount === 1;

  const fetchMembers = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/projects/${projectId}/members`
      );

      setMembers(response.data.data);
    } catch (error) {
      showNotification(error, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const searchUsers = async (value) => {
    setSearch(value);

    if (!value.trim()) {
      setUsers([]);
      return;
    }

    try {
      setSearchLoading(true);

      const response = await api.get(
        `/projects/${projectId}/users`,
        {
          params: {
            search: value
          }
        }
      );

      setUsers(response.data.data);
    } catch (error) {
      showNotification(error, "error");
    } finally {
      setSearchLoading(false);
    }
  };

  const resetAddMember = () => {
    setShowAddMember(false);
    setSearch("");
    setUsers([]);
    setSelectedUser(null);
    setRole("member");
  };

  const handleAddMember = async () => {
    if (!selectedUser) {
      showNotification(
        "Please select a user",
        "error"
      );
      return;
    }

    try {
      await api.post(
        `/projects/${projectId}/members`,
        {
          email: selectedUser.email,
          role
        }
      );

      showNotification(
        "Member added successfully",
        "success"
      );

      resetAddMember();
      fetchMembers();
    } catch (error) {
      showNotification(error, "error");
    }
  };

  const handleUpdateRole = async (userId) => {
    try {
      await api.put(
        `/projects/${projectId}/members/${userId}`,
        {
          newRole: editingRole
        }
      );

      showNotification(
        "Member role updated successfully",
        "success"
      );

      setEditingUserId(null);
      setEditingRole("");

      fetchMembers();
    } catch (error) {
      showNotification(error, "error");
    }
  };

  const handleRemoveMember = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this member?"
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/projects/${projectId}/members/${userId}`
      );

      showNotification(
        "Member removed successfully",
        "success"
      );

      fetchMembers();
    } catch (error) {
      showNotification(error, "error");
    }
  };

  const handleLeaveProject = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to leave this project?"
    );

    if (!confirmed) return;

    try {
      setLeaveLoading(true);

      await api.delete(
        `/projects/${projectId}/members/leave`
      );

      showNotification(
        "You left the project successfully",
        "success"
      );

      window.location.href = "/projects";
    } catch (error) {
      showNotification(error, "error");
    } finally {
      setLeaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1F2A23] border border-[#E8E3D8] dark:border-[#344238] rounded-2xl p-6">
        <p className="text-[#72776F] dark:text-[#AAB5AE]">
          Loading members...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1F2A23] border border-[#E8E3D8] dark:border-[#344238] rounded-2xl p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">

        <div>
          <h2 className="text-xl font-bold text-[#26352D] dark:text-[#F1F4ED]">
            Members
          </h2>

          <p className="text-sm text-[#72776F] dark:text-[#AAB5AE] mt-1">
            People working on this project
          </p>
        </div>

        <div className="flex items-center gap-3">

          <span className="px-3 py-1 rounded-full bg-[#E8EFEA] dark:bg-[#355E4A] text-[#355E4A] dark:text-[#DCE8DF] text-sm font-semibold">
            {members.length}
          </span>

          {isAdmin && (
            <button
              onClick={() => setShowAddMember(true)}
              className="px-4 py-2 rounded-lg bg-[#355E4A] text-white text-sm font-semibold hover:bg-[#2B4D3D] transition"
            >
              + Add Member
            </button>
          )}

        </div>
      </div>

      {/* Members */}
      {members.length === 0 ? (
        <p className="text-[#72776F] dark:text-[#AAB5AE]">
          No members found.
        </p>
      ) : (
        <div className="space-y-3">

          {members.map((member) => {

            const isCurrentUser =
              member.user._id === user?._id;

            const canEditThisMember =
              isAdmin &&
              (!isCurrentUser || adminCount > 1);

            const canRemoveThisMember =
              isAdmin &&
              !isCurrentUser &&
              !(
                member.role === "admin" &&
                adminCount === 1
              );

            return (
              <div
                key={member.user._id}
                className="flex items-center justify-between p-4 rounded-xl bg-[#F7F4ED] dark:bg-[#2A382F] border border-[#E8E3D8] dark:border-[#344238]"
              >

                <div className="flex items-center gap-3">

                  {member.user.avatar ? (
                    <img
                      src={member.user.avatar}
                      alt={member.user.username}
                      className="w-10 h-10 min-w-10 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 min-w-10 rounded-full bg-[#DCE8DF] dark:bg-[#355E4A] flex items-center justify-center text-[#355E4A] dark:text-[#DCE8DF] font-semibold">
                      {member.user.username
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  <div>
                    <p className="font-semibold text-[#26352D] dark:text-[#F1F4ED]">
                      {member.user.fullName ||
                        member.user.username}

                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-[#72776F] dark:text-[#AAB5AE] font-normal">
                          You
                        </span>
                      )}
                    </p>

                    <p className="text-sm text-[#72776F] dark:text-[#AAB5AE]">
                      @{member.user.username}
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-3">

                  {editingUserId === member.user._id ? (
                    <>
                      <select
                        value={editingRole}
                        onChange={(e) =>
                          setEditingRole(e.target.value)
                        }
                        className="px-3 py-2 rounded-lg border border-[#E8E3D8] dark:border-[#344238] bg-white dark:bg-[#2A382F] dark:text-[#F1F4ED] text-sm outline-none"
                      >
                        <option value="member">
                          Member
                        </option>

                        <option value="project_admin">
                          Project Admin
                        </option>

                        <option value="admin">
                          Admin
                        </option>
                      </select>

                      <button
                        onClick={() =>
                          handleUpdateRole(
                            member.user._id
                          )
                        }
                        className="text-sm font-semibold text-[#355E4A] dark:text-[#6F9B82] hover:underline"
                      >
                        Save
                      </button>

                      <button
                        onClick={() => {
                          setEditingUserId(null);
                          setEditingRole("");
                        }}
                        className="text-sm text-[#72776F] dark:text-[#AAB5AE] hover:underline"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="px-3 py-1 rounded-full bg-[#E8EFEA] dark:bg-[#355E4A] text-[#355E4A] dark:text-[#DCE8DF] text-xs font-semibold capitalize">
                        {member.role.replace(
                          "_",
                          " "
                        )}
                      </span>

                      {canEditThisMember && (
                        <button
                          onClick={() => {
                            setEditingUserId(
                              member.user._id
                            );
                            setEditingRole(
                              member.role
                            );
                          }}
                          className="text-sm text-[#355E4A] dark:text-[#6F9B82] hover:underline"
                        >
                          Edit
                        </button>
                      )}

                      {canRemoveThisMember && (
                        <button
                          onClick={() =>
                            handleRemoveMember(
                              member.user._id
                            )
                          }
                          className="text-sm text-red-500 dark:text-[#D89A94] hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </>
                  )}

                </div>
              </div>
            );
          })}

        </div>
      )}

      {/* Leave Project */}
      <div className="border-t border-[#E8E3D8] dark:border-[#344238] mt-6 pt-5 flex justify-end">

        <button
          onClick={handleLeaveProject}
          disabled={leaveLoading || isOnlyAdmin}
          className="px-4 py-2 rounded-lg border border-red-200 dark:border-[#60413D] text-red-600 dark:text-[#D89A94] text-sm font-semibold hover:bg-red-50 dark:hover:bg-[#3A2927] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {leaveLoading
            ? "Leaving..."
            : "Leave Project"}
        </button>

      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">

          <div className="w-full max-w-md bg-white dark:bg-[#1F2A23] rounded-2xl border border-[#E8E3D8] dark:border-[#344238] shadow-xl p-6">

            <div className="flex items-center justify-between mb-6">

              <div>
                <h3 className="text-xl font-bold text-[#26352D] dark:text-[#F1F4ED]">
                  Add Member
                </h3>

                <p className="text-sm text-[#72776F] dark:text-[#AAB5AE] mt-1">
                  Add someone to this project
                </p>
              </div>

              <button
                onClick={resetAddMember}
                className="text-[#72776F] dark:text-[#AAB5AE] hover:text-[#26352D] dark:hover:text-[#F1F4ED] text-xl"
              >
                ×
              </button>

            </div>

            {/* Search */}
            <div className="mb-5">

              <label className="block text-sm font-semibold text-[#26352D] dark:text-[#F1F4ED] mb-2">
                Search User
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  searchUsers(e.target.value)
                }
                placeholder="Search by username, name or email"
                className="w-full px-4 py-3 rounded-xl border border-[#E8E3D8] dark:border-[#344238] bg-[#F7F4ED] dark:bg-[#2A382F] text-[#26352D] dark:text-[#F1F4ED] placeholder:text-[#9A9F99] outline-none focus:ring-2 focus:ring-[#DCE8DF] dark:focus:ring-[#355E4A]"
              />

            </div>

            {/* Search Results */}
            {searchLoading && (
              <p className="text-sm text-[#72776F] dark:text-[#AAB5AE] mb-4">
                Searching...
              </p>
            )}

            {users.length > 0 && (
              <div className="border border-[#E8E3D8] dark:border-[#344238] rounded-xl overflow-hidden mb-5">

                {users.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => {
                      setSelectedUser(item);
                      setSearch(
                        item.fullName ||
                        item.username
                      );
                      setUsers([]);
                    }}
                    className={`w-full flex items-center gap-3 p-3 text-left hover:bg-[#F7F4ED] dark:hover:bg-[#2A382F] transition ${
                      selectedUser?._id === item._id
                        ? "bg-[#E8EFEA] dark:bg-[#355E4A]"
                        : "bg-white dark:bg-[#1F2A23]"
                    }`}
                  >

                    {item.avatar ? (
                      <img
                        src={item.avatar}
                        alt={item.username}
                        className="w-9 h-9 object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9  bg-[#DCE8DF] dark:bg-[#355E4A] flex items-center justify-center text-[#355E4A] dark:text-[#DCE8DF] font-semibold">
                        {item.username
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>
                    )}

                    <div>
                      <p className="font-semibold text-[#26352D] dark:text-[#F1F4ED]">
                        {item.fullName ||
                          item.username}
                      </p>

                      <p className="text-xs text-[#72776F] dark:text-[#AAB5AE]">
                        @{item.username}
                      </p>
                    </div>

                  </button>
                ))}

              </div>
            )}

            {/* Selected user */}
            {selectedUser && (
              <div className="mb-5 p-3 rounded-xl bg-[#E8EFEA] dark:bg-[#355E4A] border border-[#DCE8DF] dark:border-[#344238]">
                <p className="text-sm font-semibold text-[#355E4A] dark:text-[#DCE8DF]">
                  Selected:{" "}
                  {selectedUser.fullName ||
                    selectedUser.username}
                </p>
              </div>
            )}

            {/* Role */}
            <div className="mb-6">

              <label className="block text-sm font-semibold text-[#26352D] dark:text-[#F1F4ED] mb-2">
                Role
              </label>

              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value)
                }
                className="w-full px-4 py-3 rounded-xl border border-[#E8E3D8] dark:border-[#344238] bg-[#F7F4ED] dark:bg-[#2A382F] text-[#26352D] dark:text-[#F1F4ED] outline-none"
              >
                <option value="member">
                  Member
                </option>

                <option value="project_admin">
                  Project Admin
                </option>

                <option value="admin">
                  Admin
                </option>
              </select>

            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">

              <button
                onClick={resetAddMember}
                className="px-4 py-2.5 rounded-lg border border-[#E8E3D8] dark:border-[#344238] text-[#72776F] dark:text-[#AAB5AE] hover:bg-[#F7F4ED] dark:hover:bg-[#2A382F] transition"
              >
                Cancel
              </button>

              <button
                onClick={handleAddMember}
                disabled={!selectedUser}
                className="px-5 py-2.5 rounded-lg bg-[#355E4A] text-white font-semibold hover:bg-[#2B4D3D] disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Add Member
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ProjectMembers;