import { prisma } from "../db/db";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";
import type { Request, Response } from "express";

export const createNotes = asyncHandler(async (req: Request, res: Response) => {

    const {note} = req.body;
    const {teamId} = req.params;

    const createdNote = await prisma.note.create({
        data: {
            teamId: `${teamId}`,
            note
        },
    });

    return res.status(200).json(
        new ApiResponse(200, 'Note created successfully', createdNote),
    )


}) 

export const getAllNotes = asyncHandler(async (req: Request, res: Response) => {
    const {teamId} = req.params

    const notes = await prisma.note.findMany({
        where: {
            teamId: `${teamId}`,
        },
    });

    return res.status(200).json(
        new ApiResponse(200, 'Notes fetched successfully', notes),
    )
}) 

export const getNoteById = asyncHandler(async (req: Request, res: Response) => {
    const {teamId, noteId} = req.params

    const note = await prisma.note.findUnique({
        where: {
            id: `${noteId}`,
            teamId: `${teamId}`,
        },
    });

    return res.status(200).json(
        new ApiResponse(200, 'Note fetched successfully', note),
    )
}) 

export const updateNoteById = asyncHandler(async (req: Request, res: Response) => {

    const {teamId, noteId} = req.params
    const {note} = req.body

    const updatedNote = await prisma.note.update({
        where: {
            id: `${noteId}`,
            teamId: `${teamId}`,
        },
        data: note
    });

    return res.status(200).json(
        new ApiResponse(200, 'Note updated successfully', updatedNote),
    )


}) 

export const deleteNoteById = asyncHandler(async (req: Request, res: Response) => {

    const {teamId, noteId} = req.params

    const deletedNote = await prisma.note.delete({
        where: {
            id: `${noteId}`,
            teamId: `${teamId}`,
        },
    });

    return res.status(200).json(
        new ApiResponse(200, 'Note deleted successfully', deletedNote),
    )

}) 


