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