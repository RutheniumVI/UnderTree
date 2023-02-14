import React from 'react'
import { ProSidebarProvider } from 'react-pro-sidebar';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { useState } from 'react';
import '../Styles/NewFileBar.css'

function NewFileBar() {
    const [filesList, setFilesList] = useState([{name:"file1"},{name:"file2"},{name:"file3"}]);
    const [foldersList, setFoldersList] = useState([{name:"folder1", files:[{name:"file1"},{name:"file2"},{name:"file3"}]},{name:"folder2"},{name:"folder3"}])
    const [active, setActive] = useState(true);

    function handleClick(){
        //setActive(!active)
        console.log("clicked")
    }
  return (
    <div className='card my-card'>
        <div className='card-header'>
            <button type="button" className="btn btn-light btn-lg">
                <i className="bi bi-file-earmark-plus"></i>
            </button> 
            <button type="button" className="btn btn-light btn-lg">
                <i className="bi bi-cloud-upload"></i>
            </button>  
            <button type="button" className="btn btn-light btn-lg">
                <i class="bi bi-folder-plus"></i>
            </button>  
        </div>
    <ProSidebarProvider>
        <Sidebar>
            <Menu>
                {foldersList.map((folder, x) => {
                    return <SubMenu label={folder.name}> 
                        {foldersList[x].files?.map((file) => {
                        return <MenuItem onClick={handleClick}> 
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="checkbox" id="inlineCheckbox1" value="option1"/>
                            <label className="form-check-label" for="inlineCheckbox1">{file.name}</label>
                        </div>
                        <button type="button" className="btn btn-light my-btn"><i class="bi bi-three-dots-vertical"></i></button>    
                        </MenuItem>
                })}
                    </SubMenu>
                })}
                {filesList.map((file) => {
                    return <MenuItem> 
                    <div className="form-check form-check-inline">
                            <input className="form-check-input" type="checkbox" id="inlineCheckbox1" value="option1"/>
                            <label className="form-check-label" for="inlineCheckbox1">{file.name}</label>
                    </div>
                    <button type="button" className="btn btn-light"><i class="bi bi-three-dots-vertical"></i></button></MenuItem>
                })}
            </Menu>
        </Sidebar>
    </ProSidebarProvider>
    </div>

  )
}

export default NewFileBar