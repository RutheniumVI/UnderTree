/*
Author: Faiq Ahmed
Date: February 10, 2023
Purpose: Component to receive an image from the server and display it
*/

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../Styles/DisplayImage.css'

// This component is used to display an image that is retrieved from the server
function DisplayImage({file}) {
    const { owner, projectName } = useParams();
    const[image, setImage] = useState("")

    useEffect(() => {
        getImage()
    }, [file]);

    // Gets the image from the server and sets the image state
    function getImage(){
        fetch(process.env.REACT_APP_API_URL+"/file/getImage?file=" + file.filePath + "&owner="+owner+"&projectName="+projectName, {
            method: "GET",
            credentials: 'include'
        })
        .then(async (res) => {
            const blob = await res.blob()
            setImage(URL.createObjectURL(blob))
        })
        .catch((err) => {
            console.log(err);
        });
    }

    return (
        <div className='imageContainer' style={{backgroundImage: `url(${image})`}}>
        </div>
    );
}

export default DisplayImage;