import React from 'react';
import axios from 'axios';

async function handleCreateProject() {
  console.log("Creating Project");      
  await axios.post("http://localhost:8000/api/github/createProject", {
    name: "UnderTree-Test",
    description: "This is a repository created by the user in the application UnderTree",
    homepage: "https://undertree.ca",
    repoPrivate: false,
  }, {
    withCredentials: true,
  }).then((res) => {
    console.log(res.data)
  }).catch((error) => {
    console.error(`Error creating project`);
  });
}

function CreateProject() {
  return (
    <div> 
      <h2>Create GitHub Repo</h2>
      <button onClick={() => handleCreateProject()}>
        New Project
      </button>
    </div>

  );
}

export default CreateProject;