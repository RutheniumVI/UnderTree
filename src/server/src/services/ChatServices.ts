import express, {Request, Response} from 'express';
const router = express.Router();
import { AuthServices } from "./AuthServices.js";
import { AuthUtil } from '../utils/AuthUtil.js';
import { ChatDB } from '../database_interface/ChatDB.js';

router.use(AuthUtil.authorizeJWT);
router.use(AuthUtil.authorizeProjectAccess);
router.route("/getAvatar").get(getUserAvatar);
router.route("/sendMessage").post(saveMessageToDB);
router.route("/getMessages").get(getMessagesFromDB);

async function getUserAvatar(req: Request, res: Response): Promise<void> {
  const avatar_url = await AuthServices.getUserPropertyWithToken(res.locals.token, "avatar_url");
  res.status(200).json({ "avatar": avatar_url });
}

async function saveMessageToDB(req: Request, res: Response): Promise<void> {
  const message = req.body.message;
  try {
    await ChatDB.addMessage(message);
  } catch (err) {
    console.log(err);
  }
}

async function getMessagesFromDB(req: Request, res: Response): Promise<void> {
  const room = req.query.room as string;  
  try {
    const messages = await ChatDB.getMessages(room);
    res.status(200).json({ messages: messages });
  } catch (err) {
    console.log(err);
  }
}

export { router }

