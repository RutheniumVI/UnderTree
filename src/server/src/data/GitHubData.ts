/*
Author: Kevin Kannammalil
Date: March 20, 2023
Purpose: GitHub Data module, contains the data types for all github related functionality that are used throughout the project
*/

interface GitHubFiles {
    texFiles: GitHubFile[],
    imageFiles: GitHubFile[]
}

interface GitHubFile {
    name: string,
    path: string,
    sha: string,
    url: string
}

interface GitHubFileContent {
    content: string,
    encoding: string
}

export { GitHubFiles, GitHubFile, GitHubFileContent };