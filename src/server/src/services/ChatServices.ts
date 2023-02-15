import express, {Request, Response} from 'express';
const router = express.Router();
import { AuthServices } from "./AuthServices.js";
import { AuthUtil } from '../utils/AuthUtil.js';
import { Message } from '../data/ChatData.js';
import { ChatDB } from '../database_interface/ChatDB.js';

router.use(AuthUtil.authorizeJWT);
router.route("/getAvatar").get(getUserAvatar);
router.route("/sendMessage").post(saveMessageToDB);
router.route("/getMessages").get(getMessagesFromDB);

async function getUserAvatar(req: Request, res: Response): Promise<void> {
  let token = req.cookies["undertree-jwt"];

  let avatar_url = await AuthServices.getUserPropertyWithToken(token, "avatar_url");

  console.log(avatar_url);
  res.status(200).json({ "avatar": avatar_url });
}

async function saveMessageToDB(req: Request, res: Response): Promise<void> {
  console.log("Save Message to Database");
  let message = req.body.message;
  try {
    await ChatDB.addMessage(message);
  } catch (err) {
    console.log(err);
  }
}

async function getMessagesFromDB(req: Request, res: Response): Promise<void> {
  let room = req.query.room as string;  
  console.log("Retrieving messages from Database for Room: ", room);
  let messages = []
  try {
    messages = await ChatDB.getMessages(room);
    res.status(200).json({ messages: messages });
  } catch (err) {
    console.log(err);
  }
}

export { router }

