import React from 'react';
import axios from 'axios';

async function handleCommit() {
  console.log("Committing Files");      
  await axios.post(process.env.REACT_APP_API_URL+"/github/commitFiles", {
    projectName: "UnderTree-Test",
    owner: "KevinRK29",
    files: [{ filepath: "main.tex", content: "This the content for the main tex file of the repo made by UnderTree" }, 
            { filepath: "README.md", content: "This is the ent for the README.md file of the repo made by UnderTree" },
            { filepath: "test/test.tex", content: "This is the content for the test.tex file of the repo made by UnderTree" }]
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
      <h2>Commit Files</h2>
      <button onClick={() => handleCommit()}>
        Create Commit
      </button>
    </div>

  );
}

export default Commit;