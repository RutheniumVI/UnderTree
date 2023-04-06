/*
Author: Veerash Palanichamy
Date: March 20, 2023
Purpose: File Data module, contains the data types for all file related functionality that are used throughout the project
*/

interface FileData {
    projectName: string,
    owner: string,
    files: File[],
    deletedFiles: string[]
}

interface File {
    fileName: string,
    fileType: "tex"|"image"|"bib",
    filePath: string,
    contributors: string[],
    documentID?: string,
}

export { FileData, File };