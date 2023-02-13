interface FileData {
    projectName: string,
    owner: string,
    files: File[]
}

interface File {
    fileName: string,
    fileType: "tex"|"image",
    filePath: string,
    documentID: string,
}

export { FileData, File };