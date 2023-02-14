import React from 'react'
import NewFileBar from '../components/NewFileBar'

function NewFileBarPage() {
  return (
    <div>
      <NewFileBar/>
      hihihihihi
      <div class="modal fade" id="fileUpload" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="fileUploadLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header my-modal-header">
              <h1 class="modal-title fs-5" id="fileUploadLabel">File Upload</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body my-modal-body">
              <label for="basic-url" class="form-label"> <h6>Project Name:</h6></label>
                <div class="input-group">
                  <input type="text" class="form-control" id="basic-url" aria-describedby="basic-addon3"/>
            </div>
            </div>
            <div className="modal-footer my-modal-footer" style={{backgroundColor: '#BCBCBC'}}>
              <button type="button" class="btn btn-dark">Confirm</button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal fade" id="newFile" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="newFileLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header my-modal-header">
              <h1 class="modal-title fs-5" id="newFileLabel">New File</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body my-modal-body">
              <label for="basic-url" class="form-label"> <h6>Project Name:</h6></label>
                <div class="input-group">
                  <input type="text" class="form-control" id="basic-url" aria-describedby="basic-addon3"/>
            </div>
            </div>
            <div className="modal-footer my-modal-footer" style={{backgroundColor: '#BCBCBC'}}>
              <button type="button" class="btn btn-dark">Confirm</button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal fade" id="editFile" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="editFileLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header my-modal-header">
              <h1 class="modal-title fs-5" id="editFileLabel">Edit File</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body my-modal-body">
              <label for="basic-url" class="form-label"> <h6>Project Name:</h6></label>
                <div class="input-group">
                  <input type="text" class="form-control" id="basic-url" aria-describedby="basic-addon3"/>
            </div>
            </div>
            <div className="modal-footer my-modal-footer" style={{backgroundColor: '#BCBCBC'}}>
              <button type="button" class="btn btn-dark">Confirm</button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal fade" id="deleteFile" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="deleteFileLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header my-modal-header">
              <h1 class="modal-title fs-5" id="deleteFileLabel">Delete File</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body my-modal-body">
              <p>Are you sure you want to delete this file?</p>
            </div>
            </div>
            <div className="modal-footer my-modal-footer" style={{backgroundColor: '#BCBCBC'}}>
              <button type="button" class="btn btn-dark">Cancel</button>
              <button type="button" class="btn btn-dark">Confirm</button>
            </div>
          </div>
        </div>
      </div>
      
  )
}

export default NewFileBarPage;