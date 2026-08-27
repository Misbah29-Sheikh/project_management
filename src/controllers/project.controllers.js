import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose"
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";

const getProjects = asyncHandler(async (req, res) => {
  const projects = await ProjectMember.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: "projects",
        localField: "project",
        foreignField: "_id",
        as: "projects",
        pipeline: [
          {
            $lookup: {
              from: "projectmembers",
              localField: "_id",
              foreignField: "project",
              as: "projectmembers"
            }
          },
          {
            $addFields: {
              members: {
                $size: "$projectmembers"
              }
            }
          }
        ]
      }
    },
    {
      $unwind: "$projects"
    },
    {
      $project: {
        projects: {
          _id: 1,
          name: 1,
          description: 1,
          members: 1,
          createdAt: 1,
          createdBy: 1
        },
        role: 1,
        _id: 0
      }
    }
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projects,
        "Projects fetched successfully"
      )
    )
});

const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId)
    .populate("createdBy", "username fullName");

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const projectMember = await ProjectMember.findOne({
    project: projectId,
    user: req.user._id
  }).select("role");

  if (!projectMember) {
    throw new ApiError(403, "You are not a member of this project");
  }

  const projectData = {
    ...project.toObject(),
    role: projectMember.role
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projectData,
        "Project fetched successfully"
      )
    );
});

const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body

  const project = await Project.create({
    name,
    description,
    createdBy: new mongoose.Types.ObjectId(req.user._id)
  });

  await ProjectMember.create({
    user: new mongoose.Types.ObjectId(req.user._id),
    project: new mongoose.Types.ObjectId(project._id),
    role: UserRolesEnum.ADMIN
  })

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        project,
        "Project created successfully"
      )
    )
})

const updateProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body
  const { projectId } = req.params

  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      name,
      description
    },
    { new: true }
  )

  if (!project) {
    throw new ApiError(404, "Project not found")
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        project,
        "Project updated successfully"
      )
    )
})

const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params

  const project = await Project.findByIdAndDelete(projectId)

  if (!project) {
    throw new ApiError(404, "Project not found")
  }

  await ProjectMember.deleteMany({
    project: projectId
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Project deleted successfully"
      )
    )
})

const addMembersToProject = asyncHandler(async (req, res) => {
  const { email, role } = req.body
  const { projectId } = req.params

  const user = await User.findOne({ email })

  if (!user) {
    throw new ApiError(404, "User does not exist")
  }

  await ProjectMember.findOneAndUpdate(
    {
      user: new mongoose.Types.ObjectId(user._id),
      project: new mongoose.Types.ObjectId(projectId)
    },
    {
      user: new mongoose.Types.ObjectId(user._id),
      project: new mongoose.Types.ObjectId(projectId),
      role: role
    },
    {
      new: true,
      upsert: true
    }
  )

  return res.status(201).json(
    new ApiResponse(
      201,
      {},
      "Project member added successfully"
    )
  )
})

const getProjectMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found")
  }

  const projectMembers = await ProjectMember.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId)
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
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
        user: {
          $arrayElemAt: ["$user", 0]
        }
      }
    },
    {
      $project: {
        project: 1,
        user: 1,
        role: 1,
        createdAt: 1,
        updatedAt: 1,
        _id: 0
      }
    }
  ])

  return res.status(200).json(
    new ApiResponse(
      200,
      projectMembers,
      "Project Members fetched successfully"
    )
  )
})

const updateMemberRole = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const { newRole } = req.body;

  if (!AvailableUserRole.includes(newRole)) {
    throw new ApiError(400, "Invalid Role");
  }

  const projectMember = await ProjectMember.findOne({
    project: projectId,
    user: userId
  });

  if (!projectMember) {
    throw new ApiError(404, "Project member not found");
  }

  // Prevent the project from having zero admins
  if (
    projectMember.role === UserRolesEnum.ADMIN &&
    newRole !== UserRolesEnum.ADMIN
  ) {
    const adminCount = await ProjectMember.countDocuments({
      project: projectId,
      role: UserRolesEnum.ADMIN
    });

    if (adminCount === 1) {
      throw new ApiError(
        400,
        "The project must have at least one admin"
      );
    }
  }

  projectMember.role = newRole;
  await projectMember.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      projectMember,
      "Member role updated"
    )
  );
});

const deleteMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;

  const projectMember = await ProjectMember.findOne({
    project: projectId,
    user: userId
  });

  if (!projectMember) {
    throw new ApiError(404, "Project member not found");
  }

  if (projectMember.role === UserRolesEnum.ADMIN) {
    const adminCount = await ProjectMember.countDocuments({
      project: projectId,
      role: UserRolesEnum.ADMIN
    });

    if (adminCount === 1) {
      throw new ApiError(
        400,
        "You cannot remove the only admin"
      );
    }
  }

  await ProjectMember.findByIdAndDelete(projectMember._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "Member removed successfully"
    )
  );
});

const getUsersForProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { search = "" } = req.query;

  const existingMembers = await ProjectMember.find({
    project: projectId
  }).select("user");

  const existingUserIds = existingMembers.map(
    (member) => member.user
  );

  const searchFilter = search
    ? {
        $or: [
          { username: { $regex: search, $options: "i" } },
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ]
      }
    : {};

  const users = await User.find({
    _id: { $nin: existingUserIds },
    ...searchFilter
  })
    .select("_id username fullName avatar email")
    .limit(10);

  return res.status(200).json(
    new ApiResponse(
      200,
      users,
      "Users fetched successfully"
    )
  );
});

const leaveProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const projectMember = await ProjectMember.findOne({
    project: projectId,
    user: req.user._id
  });

  if (!projectMember) {
    throw new ApiError(
      404,
      "You are not a member of this project"
    );
  }

  if (projectMember.role === UserRolesEnum.ADMIN) {
    const adminCount = await ProjectMember.countDocuments({
      project: projectId,
      role: UserRolesEnum.ADMIN
    });

    if (adminCount === 1) {
      throw new ApiError(
        400,
        "You cannot leave because you are the only admin"
      );
    }
  }

  await ProjectMember.findByIdAndDelete(projectMember._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "You left the project successfully"
    )
  );
});

export { addMembersToProject, createProject, deleteMember, getProjects, getProjectById, getProjectMembers, updateMemberRole, updateProject, deleteProject, getUsersForProject, leaveProject }