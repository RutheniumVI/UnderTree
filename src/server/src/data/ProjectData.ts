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