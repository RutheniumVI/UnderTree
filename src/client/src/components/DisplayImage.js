import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../Styles/DisplayImage.css'

function DisplayImage({file}) {
    const { owner, projectName } = useParams();
    const[image, setImage] = useState("")

    useEffect(() => {
        getImage()
    }, [file]);

    function getImage(){
        fetch("http://localhost:8000/api/file/getImage?file=" + file.filePath + "&owner="+owner+"&projectName="+projectName, {
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