/*
Author: Kevin Kannammalil
Date: March 20, 2023
Purpose: Auth Database Interface Module, responsible for making changes to database for the users collection
*/

import { DBClient } from "../utils/MongoDBUtil";
import { GitHubUser, MongoUser } from "../data/AuthData";

const collectionName = "users";

// Add a new logged in user to the database
async function addUser(user: GitHubUser, token: string): Promise<void> {

	const response = await DBClient.collectionExists(collectionName);
	if (!response) {
		await DBClient.createCollection(collectionName);
		await DBClient.getCollection(collectionName).createIndex({ username: 1 }, { unique: true });
		console.log("Created users collection");
	}

	try {
		await DBClient.getCollection(collectionName).insertOne({
			username: user.login,
			jwt: token,
			access_token: user.access_token,
			name: user.name,
			email: user.email,
			avatar_url: user.avatar_url,
		});
	} catch (err) {
		await DBClient.getCollection(collectionName).updateOne({ username: user.login }, { $set: { jwt: token } });
		console.log("Updated user: ", user.login);
		// throw Error("User is already logged in");
	}
}

// Get a users JWT token from the database
function getUserWithToken(token: string): Promise<MongoUser> {
	return new Promise((resolve, reject) => {
		DBClient.getCollection(collectionName).findOne({ jwt: token }, (err, result) => {
			if (err) {
				console.log("Error: ", err);
				return reject(null);
			}
			return resolve(result);
		});
	});
}

// Update a user's JWT token in the database given the old and new token
function updateUserWithToken(oldToken: string, newToken: string): Promise<void> {
	return new Promise((resolve, reject) => {
		DBClient.getCollection(collectionName).updateOne({ jwt: oldToken }, { $set: { jwt: newToken } }, (err, result) => {
			if (err) {
				console.log("Error: ", err);
				return reject(null);
			}
			return resolve(result);
		});
	});
}

// Get a user's email from the database given a user's name
async function getUserEmail(userName: string){
	const result = await DBClient.getCollection(collectionName).findOne({ username: userName });
	return result.email;
}

// Delete a user from the database given their JWT token
async function deleteUserWithToken(token: string): Promise<void> {
	const delResult = await DBClient.getCollection(collectionName).deleteMany({ jwt: token });
	if (delResult.deletedCount > 0) { 
		console.log("Deleted User: " + token);
	} else {
		console.log("No user matching token to delete");
	}

}

const AuthDB = {
	addUser,
	getUserWithToken,
	updateUserWithToken,
	deleteUserWithToken,
	getUserEmail
};

export { AuthDB };