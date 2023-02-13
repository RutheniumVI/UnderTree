import React from 'react';
import axios from 'axios';

async function handleAddCollab() {
  console.log("Adding user");      
  await axios.post("http://localhost:8000/api/github/importRepo", {
    repo: "UnderTree",
    // userToAdd: "fahmed8383",
  }, {
    withCredentials: true,
  }).then((res) => {
    console.log(res.data)
  }).catch((error) => {
    console.error(`Error adding collaborator`);
  });
}

async function handleRemoveCollab() {
  console.log("Removing user");
  await axios.post("http://localhost:8000/api/github/removeCollaborator", {
    repo: "UnderTree-Test",
    userToRemove: "fahmed8383",
  }, {
    withCredentials: true,
  }).then((res) => {
    console.log(res.data)
  }).catch((error) => {
    console.error(`Error removing collaborator`);
  });
}

function Collab() {
  return (
    <div> 
      <h2>Import Repo</h2>
      <button onClick={() => handleAddCollab()}>
        Import
      </button>
      <h2>Remove Collaborator</h2>
      <button onClick={() => handleRemoveCollab()}>
        Remove Faiq
      </button>
    </div>

  );
}

export default Collab;