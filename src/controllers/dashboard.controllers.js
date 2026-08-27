import mongoose from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { Project } from "../models/project.models.js";
import { Task } from "../models/task.models.js";
import { TaskStatusEnum } from "../utils/constants.js";

const getDashboard = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);

  // Get projects the logged-in user is a member of
  const projectMemberships = await ProjectMember.find({
    user: userId
  }).select("project");

  const projectIds = projectMemberships.map(
    (membership) => membership.project
  );

  // If user has no projects
  if (projectIds.length === 0) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          stats: {
            totalProjects: 0,
            totalTasks: 0,
            completedTasks: 0,
            pendingTasks: 0
          },
          recentProjects: [],
          recentTasks: []
        },
        "Dashboard data fetched successfully"
      )
    );
  }

  // Get projects
  const projects = await Project.find({
    _id: { $in: projectIds }
  })
    .select("_id name description createdAt")
    .sort({ createdAt: -1 });

  // Get tasks from user's projects
  const tasks = await Task.find({
    project: { $in: projectIds }
  })
    .populate("project", "name")
    .populate("assignedTo", "avatar username fullName")
    .sort({ createdAt: -1 });

  const completedTasks = tasks.filter(
    (task) => task.status === TaskStatusEnum.DONE
  ).length;

  const pendingTasks = tasks.filter(
    (task) => task.status !== TaskStatusEnum.DONE
  ).length;

  const recentProjects = projects.slice(0, 5);

  const recentTasks = tasks.slice(0, 5);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        stats: {
          totalProjects: projects.length,
          totalTasks: tasks.length,
          completedTasks,
          pendingTasks
        },
        recentProjects,
        recentTasks
      },
      "Dashboard data fetched successfully"
    )
  );
});

export { getDashboard };