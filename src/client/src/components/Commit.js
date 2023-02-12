import React from 'react';
import axios from 'axios';

async function handleCommit() {
  console.log("Creating Project");      
  await axios.post("http://localhost:8000/api/github/commitFile", {
    repo: "UnderTree-Test",
    filepath: "README.md",
  }, {
    withCredentials: true,
  }).then((res) => {
    console.log(res.data)
  }).catch((error) => {
    console.error(`Error making commit`);
  });
}

function Commit() {
  return (
    <div> 
      <h2>Commit File</h2>
      <button onClick={() => handleCommit()}>
        Create Commit
      </button>
    </div>

  );
}

export default Commit;