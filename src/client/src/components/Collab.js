import React from 'react';
import axios from 'axios';

async function handleAddCollab() {
  console.log("Adding user");      
  await axios.post("http://localhost:8000/api/github/addCollaborator", {
    repo: "UnderTree-Test",
    userToAdd: "fahmed8383",
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
      <h2>Add Collaborator</h2>
      <button onClick={() => handleAddCollab()}>
        Add Faiq
      </button>
      <h2>Remove Collaborator</h2>
      <button onClick={() => handleRemoveCollab()}>
        Remove Faiq
      </button>
    </div>

  );
}

export default Collab;