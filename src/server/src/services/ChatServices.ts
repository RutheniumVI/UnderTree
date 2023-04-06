/*
Author: Eesha Qureshi
Date: March 25, 2023
Purpose: Chat Service Module, responsible for handling all logic associated with chat that is transmitted from the frontend.
*/

import express, {Request, Response} from "express";
const router = express.Router();
import { AuthServices } from "./AuthServices";
import { AuthUtil } from "../utils/AuthUtil";
import { ChatDB } from "../database_interface/ChatDB";

// Add middleware to validate the user sending the API request before the request is processed
router.use(AuthUtil.authorizeJWT);
router.use(AuthUtil.authorizeProjectAccess);

// Set up routes for the api calls that the frontend can use to communicate with each function
router.route("/getAvatar").get(getUserAvatar);
router.route("/sendMessage").post(saveMessageToDB);
router.route("/getMessages").get(getMessagesFromDB);

// Get the user's API given their username
async function getUserAvatar(req: Request, res: Response): Promise<void> {
	const avatar_url = await AuthServices.getUserPropertyWithToken(res.locals.token, "avatar_url");
	res.status(200).json({ "avatar": avatar_url });
}

// Save the user's new message to the database
async function saveMessageToDB(req: Request, res: Response): Promise<void> {
	const message = req.body.message;
	try {
		await ChatDB.addMessage(message);
	} catch (err) {
		console.log(err);
	}
}

// Get all messages from a specific room for the user
async function getMessagesFromDB(req: Request, res: Response): Promise<void> {
	const room = req.query.room as string;  
	try {
		const messages = await ChatDB.getMessages(room);
		res.status(200).json({ messages: messages });
	} catch (err) {
		console.log(err);
	}
}

export { router };

