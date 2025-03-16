import { Router } from "express";

import getUsers from "../../controllers/messages/getUsers.js";
import getMessages from "../../controllers/messages/getMessages.js";
import sendMessage from "../../controllers/messages/sendMessage.js";
import readUnread from "../../controllers/messages/readUnread.js";
import deleteForMe from "../../controllers/messages/deleteForMe.js";

const router = Router();

router.get('/get-users', getUsers);
router.get('/get-messages/:id', getMessages);
router.post('/send/:id', sendMessage);
router.put('/read-unread/:id', readUnread);
router.put('/delete-for-me/:msgid', deleteForMe);

export default router;