import React from 'react'
import '../Styles/NewChatUI.css'

function NewChatUI() {
  return (
    <div className='container text-center'>
        <div class="row" id="my-message">
            <div class="col-3"/>
            <div class="col">
                <p class="text-end">username</p>
                <div class="card">
                    <div class="card-body">
                        This is some text within a card body.
                    </div>
                </div>
            </div>
            <div class="col-3">
            <   figure class="figure">
                    <img src={require('./profile.PNG')} class="figure-img img-fluid rounded-circle" alt="..."/>
                </figure>
            </div>
        </div>
        <div class="row" id="your-message">
            <div class="col-3">
                <figure class="figure">
                    <img src={require('./profile.PNG')} class="figure-img img-fluid rounded-circle" alt="..."/>
                </figure>
            </div>
            <div class="col">
                <p>username</p>
                <div class="card">
                    <div class="card-body">
                        This is some text within a card body.
                    </div>
                </div>
            </div>
            <div class="col-3"/>
        </div>

        <div class="row" style={{"margin-top": "10%"}}>
            <div class="input-group mb-3">
                <input type="text" class="form-control" placeholder="Recipient's username" aria-label="Recipient's username" aria-describedby="button-addon2"/>
                <button class="btn btn-dark" type="button" id="button-addon2">Button</button>
            </div>
        </div>
    </div>
  )
}

export default NewChatUI