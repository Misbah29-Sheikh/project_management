import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { Task } from "../models/task.models.js";
import { SubTask } from "../models/subtask.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose"
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";
import { uploadToCloudinary } from "../utils/cloudinary-upload.js";

const getTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findById(projectId)

  if (!project) {
    throw new ApiError(404, "Project not found")
  }

  const tasks = await Task.find({
    project: new mongoose.Types.ObjectId(projectId)
  }).populate("assignedTo", "avatar username fullName")

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        tasks,
        "Tasks fetched successfully"
      )
    )
})

const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, status } = req.body;
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (assignedTo) {
    const projectMember = await ProjectMember.findOne({
      project: projectId,
      user: assignedTo
    });

    if (!projectMember) {
      throw new ApiError(
        400,
        "Assigned user is not a member of this project"
      );
    }
  }

  const files = req.files || [];

  const attachments = await Promise.all(
    files.map(async (file) => {
      const result = await uploadToCloudinary(
        file.buffer,
        file.originalname
      );

      return {
        url: result.secure_url,
        mimetype: file.mimetype,
        size: file.size
      };
    })
  );

  const task = await Task.create({
    title,
    description,
    project: projectId,
    assignedTo,
    assignedBy: req.user._id,
    status,
    attachments
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      task,
      "Task created successfully"
    )
  );
});

const getTaskById = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;

  const task = await Task.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(taskId),
        project: new mongoose.Types.ObjectId(projectId)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedTo",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1
            }
          }
        ]
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedBy",
        foreignField: "_id",
        as: "assignedBy",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1
            }
          }
        ]
      }
    },
    {
      $lookup: {
        from: "subtasks",
        localField: "_id",
        foreignField: "task",
        as: "subtasks",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "createdBy",
              foreignField: "_id",
              as: "createdBy",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    avatar: 1
                  }
                }
              ]
            }
          },
          {
            $addFields: {
              createdBy: {
                $arrayElemAt: ["$createdBy", 0]
              }
            }
          }
        ]
      }
    },
    {
      $addFields: {
        assignedTo: {
          $arrayElemAt: ["$assignedTo", 0]
        },
        assignedBy: {
          $arrayElemAt: ["$assignedBy", 0]
        }
      }
    }
  ]);

  if (!task || task.length === 0) {
    throw new ApiError(404, "Task not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        task[0],
        "Task fetched successfully"
      )
    );
});

const updateTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, status } = req.body
  const { projectId, taskId } = req.params;

  const task = await Task.findById(taskId)

  if (!task) {
    throw new ApiError(404, "Task not found")
  }

  if (!task.project.equals(projectId)) {
    throw new ApiError(400, "Task does not belong to the project");
  }

  if (assignedTo) {
    const user = await User.findById(assignedTo);

    if (!user) {
      throw new ApiError(404, "Assigned user not found");
    }

    const projectMember = await ProjectMember.findOne({
      project: projectId,
      user: assignedTo
    });

    if (!projectMember) {
      throw new ApiError(
        400,
        "Assigned user is not a member of this project"
      );
    }
  }

  if (title !== undefined) {
    task.title = title;
  }

  if (description !== undefined) {
    task.description = description;
  }

  if (assignedTo !== undefined) {
    task.assignedTo = assignedTo;
  }

  if (status !== undefined) {
    task.status = status;
  }

  const files = req.files || [];

  if (files.length > 0) {
    task.attachments = await Promise.all(
      files.map(async (file) => {
        const result = await uploadToCloudinary(
          file.buffer,
          file.originalname
        );

        return {
          url: result.secure_url,
          mimetype: file.mimetype,
          size: file.size
        };
      })
    );
  }

  await task.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      task,
      "Task updated successfully"
    )
  );
})

const deleteTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found")
  }

  if (!task.project.equals(projectId)) {
    throw new ApiError(400, "Task does not belong to the project");
  }

  await SubTask.deleteMany({
    task: task._id
  });

  await task.deleteOne();

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "Task deleted successfully"
    )
  );
})

const createSubTask = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const { projectId, taskId } = req.params;

  const project = await Project.findById(projectId)
  if (!project) {
    throw new ApiError(404, "Project not found")
  }

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found")
  }

  if (!task.project.equals(projectId)) {
    throw new ApiError(404, "Task does not belong to the project")
  }

  const subTask = await SubTask.create({
    title,
    task: taskId,
    createdBy: req.user._id
  })

  return res.status(201).json(
    new ApiResponse(
      201,
      subTask,
      "Subtask created successfully"
    )
  );
})

const updateSubTask = asyncHandler(async (req, res) => {
  const { title, isCompleted } = req.body;
  const { projectId, subTaskId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found")
  }

  const subTask = await SubTask.findById(subTaskId);
  if (!subTask) {
    throw new ApiError(404, "SubTask not found")
  }

  const task = await Task.findById(subTask.task);
  if (!task) {
    throw new ApiError(404, "Task not found")
  }

  if (!task.project.equals(projectId)) {
    throw new ApiError(404, "Task does not belong to the project");
  }

  if (req.user.role === "member" && title !== undefined) {
    throw new ApiError(403, "Members can only update subtask completion status")
  }

  if (title !== undefined) {
    subTask.title = title
  }

  if (isCompleted !== undefined) {
    subTask.isCompleted = isCompleted
  }

  await subTask.save();

  await subTask.populate(
    "createdBy",
    "username fullName avatar"
  );
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subTask,
        "Subtask updated successfully"
      )
    )
})

const deleteSubTask = asyncHandler(async (req, res) => {
  const { projectId, subTaskId } = req.params;

  const subTask = await SubTask.findById(subTaskId);
  if (!subTask) {
    throw new ApiError(404, "SubTask not found")
  }

  const task = await Task.findById(subTask.task);
  if (!task) {
    throw new ApiError(404, "Task not found")
  }

  if (!task.project.equals(projectId)) {
    throw new ApiError(404, "Task does not belong to the project");
  }

  await subTask.deleteOne()

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Subtask deleted successfully"
      )
    )
})

export { getTasks, getTaskById, updateTask, deleteTask, createTask, createSubTask, updateSubTask, deleteSubTask }