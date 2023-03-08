import { DBClient } from '../utils/MongoDBUtil';
import { GitHubUser, MongoUser } from '../data/AuthData';

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
      avatar_url: user.avatar_url,
    });
  } catch (err) {
    await DBClient.getCollection("users").updateOne({ username: user.login }, { $set: { jwt: token } });
    console.log("Updated user: ", user.login);
    // throw Error("User is already logged in");
  }
}

function getUserWithToken(token: string): Promise<MongoUser> {
  return new Promise((resolve, reject) => {
    DBClient.getCollection("users").findOne({ jwt: token }, (err, result) => {
      if (err) {
        console.log("Error: ", err);
        return reject(null);
      }
      return resolve(result);
    });
  });
}

function updateUserWithToken(oldToken: string, newToken: string): Promise<void> {
  return new Promise((resolve, reject) => {
    DBClient.getCollection("users").updateOne({ jwt: oldToken }, { $set: { jwt: newToken } }, (err, result) => {
      if (err) {
        console.log("Error: ", err);
        return reject(null);
      }
      return resolve(result);
    });
  });
}


async function getUserEmail(userName: String){
  const result = await DBClient.getCollection("users").findOne({ username: userName });
  return result.email;
}

async function deleteUserWithToken(token: string): Promise<void> {
    const delResult = await DBClient.getCollection("users").deleteMany({ jwt: token });
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
}

export { AuthDB }