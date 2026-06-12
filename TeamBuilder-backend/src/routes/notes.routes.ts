import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware";
import { teamRoles } from "../middlewares/team.middlewares";
import { createNotes, deleteNoteById, getAllNotes, getNoteById, updateNoteById } from "../controllers/notes.controllers";

const notesRouter = Router();

notesRouter.use(verifyJwt);

notesRouter.route('/:teamId/teams/create-note').post(teamRoles(["TEAM_LEAD"]), createNotes);
notesRouter.route('/:teamId/teams/get-all-notes').get(teamRoles(["TEAM_LEAD", "MEMBER"]),getAllNotes);
notesRouter.route('/:teamId/teams/:noteId/get-note-by-id').get(teamRoles(["TEAM_LEAD", "MEMBER"]),getNoteById);
notesRouter.route('/:teamId/teams/:noteId/update-note').patch(teamRoles(["TEAM_LEAD"]),updateNoteById);
notesRouter.route('/:teamId/teams/:noteId/delete-note').delete(teamRoles(["TEAM_LEAD"]),deleteNoteById);


export default notesRouter ;