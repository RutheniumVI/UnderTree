import React from 'react'
import { ProSidebarProvider } from 'react-pro-sidebar';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { useState } from 'react';
import '../Styles/NewFileBar.css'

function NewFileBar() {
    const [filesList, setFilesList] = useState([{name:"file1"},{name:"file2"},{name:"file3"}]);
    const [foldersList, setFoldersList] = useState([{name:"folder1", files:[{name:"file1"},{name:"file2"},{name:"file3"}]},{name:"folder2"},{name:"folder3"}])
  return (
    <div className='card my-card'>
        <div className='card-header'>
            <button type="button" className="btn btn-light btn-lg my-btn">
                <i className="bi bi-file-earmark-plus"></i>
            </button> 
            <button type="button" className="btn btn-light btn-lg my-btn">
                <i className="bi bi-cloud-upload"></i>
            </button>  
        </div>
    <ProSidebarProvider>
        <Sidebar>
            <Menu>
                {foldersList.map((folder, x) => {
                    return <SubMenu label={folder.name}> 
                        {foldersList[x].files?.map((file) => {
                        return <MenuItem> {file.name} </MenuItem>
                })}
                    </SubMenu>
                })}
                {filesList.map((file) => {
                    return <MenuItem> {file.name} </MenuItem>
                })}
            </Menu>
        </Sidebar>
    </ProSidebarProvider>
    </div>

  )
}

export default NewFileBar