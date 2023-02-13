interface ProjectData {
    projectName: string,
    owner: string,
    collaborators: string[],
    isPrivate: boolean,
    creationDate: string
}

export { ProjectData };