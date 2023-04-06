export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string;
  email: null;
  access_token: string;
}

export interface MongoUser {
  username: string,
  jwt: string,
  access_token: string,
  name: string,
  email: string;
  avatar_url: string;
}