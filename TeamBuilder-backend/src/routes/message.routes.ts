import { Router } from 'express';
import { verifyJwt } from '../middlewares/auth.middleware.js';
import { getConversation, sendMessage } from '../controllers/message.controller.js';

const messageRouter = Router();

messageRouter.use(verifyJwt);

messageRouter.route('/:courseId/:peerId').get(getConversation);
messageRouter.route('/:courseId/:peerId').post(sendMessage);

export default messageRouter;
