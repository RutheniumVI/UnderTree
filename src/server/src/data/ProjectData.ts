/*
Author: Faiq Ahmed
Date: March 3, 2023
Purpose: Project Data module, contains the data types for all project related functionality that are used throughout the project
*/

interface ProjectData {
    projectName: string,
    owner: string,
    collaborators?: string[],
    isPrivate?: boolean,
    creationDate?: Date
    commit?: Commit
}

interface Commit {
    current: CommitData,
    remote: CommitData
}

interface CommitData {
    sha: string,
    url: string
}

export { ProjectData };