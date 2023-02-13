import React from 'react';
import { useLayoutEffect } from 'react';

function Home() {

    useLayoutEffect(() => {
        if(localStorage.getItem("username") !== null){
            window.location.href = "/projects"
        }
    }, []);

    return (
        <div>
            This is home page
        </div>
    );
}
  
export default Home