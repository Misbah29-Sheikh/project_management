import {Project} from "../models/project.models.js";
import {ProjectNote} from "../models/note.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from"mongoose"

const createNote = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { content } = req.body;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const note = await ProjectNote.create({
    project: projectId,
    createdBy: req.user._id,
    content
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      note,
      "Project note created successfully"
    )
  );
});

const getNotes = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const notes = await ProjectNote.find({
    project: projectId
  }).populate("createdBy", "username fullName email avatar");;

  return res.status(200).json(
    new ApiResponse(
      200,
      notes,
      "Project notes fetched successfully"
    )
  );
});

const getNoteById = asyncHandler(async (req, res) => {
  const { projectId, noteId } = req.params;

  const note = await ProjectNote.findById(noteId)
  .populate("createdBy", "username fullName email avatar");;

  if (!note) {
    throw new ApiError(404, "Project note not found");
  }

  if (!note.project.equals(projectId)) {
    throw new ApiError(404, "Note does not belong to the project");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      note,
      "Project note fetched successfully"
    )
  );
});

const updateNote = asyncHandler(async (req, res) => {
  const { projectId, noteId } = req.params;
  const { content } = req.body;

  const note = await ProjectNote.findById(noteId);

  if (!note) {
    throw new ApiError(404, "Project note not found");
  }

  if (!note.project.equals(projectId)) {
    throw new ApiError(404, "Note does not belong to the project");
  }

  note.content = content;

  await note.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      note,
      "Project note updated successfully"
    )
  );
});

const deleteNote = asyncHandler(async (req, res) => {
  const { projectId, noteId } = req.params;

  const note = await ProjectNote.findById(noteId);

  if (!note) {
    throw new ApiError(404, "Project note not found");
  }

  if (!note.project.equals(projectId)) {
    throw new ApiError(404, "Note does not belong to the project");
  }

  await note.deleteOne();

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "Project note deleted successfully"
    )
  );
});

export {createNote, getNotes, getNoteById, updateNote, deleteNote}
