import React from 'react';
import { useLayoutEffect } from 'react';
import Projects from './Projects';
import Filebar from '../components/Filebar';

function Home() {

    useLayoutEffect(() => {
        if(localStorage.getItem("username") !== null){
            window.location.href = "/projects"
        }
    }, []);

    return (
        <div>
            <Filebar></Filebar>
        </div>
    );
}
  
export default Home