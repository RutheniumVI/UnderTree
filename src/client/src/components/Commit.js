import React from 'react';
import axios from 'axios';

async function handleCommit() {
  console.log("Creating Project");      
  await axios.post("http://localhost:8000/api/github/commitFiles", {
    repo: "UnderTree-Test",
    files: [{ filepath: "main.tex", content: "This is the main tex file of the repo made by UnderTree" }, 
            { filepath: "README.md", content: "This is the README.md file of the repo made by UnderTree" }]
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