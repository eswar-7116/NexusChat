import { Router } from "express";

import getRecentUsers from "../../controllers/messages/recentUsers.js";
import getMessages from "../../controllers/messages/getMessages.js";
import sendMessage from "../../controllers/messages/sendMessage.js";

const router = Router();

router.get('/recent-users', getRecentUsers);
router.get('/get-messages/:id', getMessages);
router.post('/send/:id', sendMessage);

export default router;