import React from 'react';
import axios from 'axios';
import '../Styles/DisplayImage.css'

function DisplayImage() {
  return (
    <div className='imageContainer'>
        <img src='https://hips.hearstapps.com/hmg-prod/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg?crop=0.752xw:1.00xh;0.175xw,0&resize=1200:*'/>
    </div>
  );
}

export default DisplayImage;