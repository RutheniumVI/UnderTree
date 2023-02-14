import React from 'react';

import { useEffect } from 'react';
import axios from 'axios';
import '../Styles/LiveUsers.css'

function LiveUsers() {
    const [userName, setUserName] = React.useState(null);
    const [userAvatar, setUserAvatar] = React.useState(null);

    useEffect(() => {
        setUserName(localStorage.getItem("username"));

        axios.get('http://localhost:8080/api/user-avatar/user='+userName)
        .then((response) => {
            setUserAvatar(response.data);
        })
        .catch((error) => {
            console.log(error);
        });
    })

    return (
        <div className='container'>
            <div className='row'>
                <div className='col avatarCol'>
                    <img className='userAvatar' src={userAvatar}/>
                </div>
                <div className='col'>
                    <h1>Welcome {userName}</h1>
                </div>
            </div>
        </div>
    );
}

export default LiveUsers;