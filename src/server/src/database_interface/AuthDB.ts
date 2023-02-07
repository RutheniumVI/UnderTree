import { DBClient } from '../utils/MongoDBUtil.js';
import { GitHubUser } from '../data/AuthData.js';

async function addUser(user: GitHubUser, token: string): Promise<void> {
  try {
    await DBClient.getCollection("users").insertOne({
      username: user.login,
      jwt: token,
      access_token: user.access_token,
      name: user.name,
      email: user.email,
      // id: user.id,
    });
  } catch (err) {
    console.error(err);
  }
}

async function getUser(username: string): Promise<GitHubUser> {
  try {
    await DBClient.getCollection("users").findOne({ username: username }, (err, result) => {
      if (err) throw err;  
      console.log(result);

      return result;
    });
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function deleteUser(username: string): Promise<void> {
  try {
    await DBClient.getCollection("users").deleteOne({ username: username });
  } catch (err) {
    console.error(err);
  }
}

const AuthDB = {
  addUser,
  getUser,
  deleteUser,
}

export { AuthDB }