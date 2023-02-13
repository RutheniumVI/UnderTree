interface FileData {
    projectName: string,
    owner: string,
    files: File[],
    deletedFiles: string[]
}

interface File {
    fileName: string,
    fileType: "tex"|"image",
    filePath: string,
    contributors: string[],
    documentID: string,
}

export { FileData, File };