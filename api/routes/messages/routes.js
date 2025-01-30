import { Router } from "express";

import getUsers from "../../controllers/messages/getUsers.js";
import getMessages from "../../controllers/messages/getMessages.js";
import sendMessage from "../../controllers/messages/sendMessage.js";

const router = Router();

router.get('/get-users', getUsers);
router.get('/get-messages/:id', getMessages);
router.post('/send/:id', sendMessage);

export default router;