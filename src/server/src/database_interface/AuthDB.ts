import { DBClient } from '../utils/MongoDBUtil.js';
import { GitHubUser } from '../data/AuthData.js';

async function addUser(user: GitHubUser, token: string): Promise<void> {

  let response = await DBClient.collectionExists("users");
  if (!response) {
    await DBClient.createCollection("users");
    await DBClient.getCollection("users").createIndex({ username: 1 }, { unique: true });
    console.log("Created users collection");
  }

  try {
    await DBClient.getCollection("users").insertOne({
      username: user.login,
      jwt: token,
      access_token: user.access_token,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    // console.error(err);
    console.log("User already exists");
    // throw Error("User is already logged in");
  }
}

function getUser(username: string): Promise<GitHubUser> {
  return new Promise((resolve, reject) => {
    DBClient.getCollection("users").findOne({ username: username }, (err, result) => {
      if (err) {
        console.log("Error: ", err);
        return reject(null);
      }
      return resolve(result);
    });
  });
}

async function deleteUser(username: string): Promise<void> {
    const delResult = await DBClient.getCollection("users").deleteMany({ username: username });
    if (delResult.deletedCount > 0) { 
      console.log("Deleted user: " + username);
    } else {
      console.log("No user to delete");
    }

}

const AuthDB = {
  addUser,
  getUser,
  deleteUser,
}

export { AuthDB }