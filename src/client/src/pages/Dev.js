import React from 'react';
import Compiler from '../components/Compiler';
import Login from '../components/Login';
import Logout from '../components/Logout';
import CreateProject from '../components/CreateProject';
import Commit from '../components/Commit';
import Collab from '../components/Collab';
import axios from 'axios';

function Dev() {
  
  return (
    <div>
      <h2></h2>
      <div class="container w-100 mw-100">
        <div class="row justify-content-start">
          <div class="col">
            {/* <Login/>
            <Logout/>
            <CreateProject/>
            <Commit/>
            <Collab/> */}
            <button onClick={() => {
              axios.post("http://localhost:8000/api/file/addFile", {
                  owner: "RutheniumVI",
                  projectName: "veetestrepo",
                  fileName: "random.tex",
                  userName: "veerash",
                  fullDirPath: "test/v/"
              }, {
                withCredentials: true,
              }).then((res) => {
                console.log(res.data)
              }).catch((error) => {
                console.error(`Error Adding user to modified`);
              });
            }}>Create File</button>

            <button onClick={() => {
              axios.post("http://localhost:8000/api/file/renameFile", {
                  owner: "RutheniumVI",
                  projectName: "veetestrepo",
                  fileName: "random.tex",
                  userName: "veerash",
                  newFileName: "rando1.tex"
              }, {
                withCredentials: true,
              }).then((res) => {
                console.log(res.data)
              }).catch((error) => {
                console.error(`Error Adding user to modified`);
              });
            }}>Rename File</button>

            <button onClick={() => {
              axios.post("http://localhost:8000/api/file/getFiles", {
                  owner: "RutheniumVI",
                  projectName: "veetestrepo"
              }, {
                withCredentials: true,
              }).then((res) => {
                console.log(res.data)
              }).catch((error) => {
                console.error(`Error Adding user to modified`);
              });
            }}>Rename File</button>
            <input type="file" name="file" onChange={(event) => {
              console.log(event.target.files[0]);
              const formData = new FormData();
              formData.append("owner", "owner2");
              formData.append("projectName", "project");
              formData.append("fullDirPath", "");
              formData.append("image", event.target.files[0]);
              axios.post("http://localhost:8000/api/file/uploadImage", formData, {
                withCredentials: true,
                headers: {'Content-Type': 'multipart/form-data'}
              }).then((res) => {
                console.log(res.data)
              }).catch((error) => {
                console.error(`Error Adding user to modified`);
              });
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dev