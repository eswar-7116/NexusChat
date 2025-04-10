import { Router } from "express";

import getUsers from "../controllers/messages/getUsers.js";
import getRecentUsers from "../controllers/messages/getRecentUsers.js";
import getMessages from "../controllers/messages/getMessages.js";
import sendMessage from "../controllers/messages/sendMessage.js";
import readUnread from "../controllers/messages/readUnread.js";
import deleteForMe from "../controllers/messages/deleteForMe.js";
import deleteForEveryone from "../controllers/messages/deleteForEveryone.js";
import editMessage from "../controllers/messages/editMessage.js";

const router = Router();

router.get('/get-users', getUsers);
router.get('/get-recent-users', getRecentUsers);
router.get('/get-messages/:id', getMessages);
router.post('/send/:id', sendMessage);
router.put('/read-unread/:id', readUnread);
router.put('/delete-for-me/:msgid', deleteForMe);
router.put('/delete-for-everyone/:msgid', deleteForEveryone);
router.put('/edit/:id', editMessage);

export default router;