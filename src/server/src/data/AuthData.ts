/*
Author: Kevin Kannammalil
Date: March 20, 2023
Purpose: Auth Data module, contains the data types for all Auth related functionality that are used throughout the project
*/

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