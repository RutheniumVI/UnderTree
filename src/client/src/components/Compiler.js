import React from 'react';
import axios from 'axios';
import { useState, useLayoutEffect } from 'react';
import { useParams } from 'react-router-dom';

import '../Styles/Compiler.css'

function Compiler({latexText}){

    const { owner, projectName } = useParams();
    const [err, setErr] = useState("");

    const [pdf, setPdf] = useState("");

    useLayoutEffect(() => {
        getPDF()
    }, []);

    function getPDF(){
        fetch("http://localhost:8000/api/file/getPDF?file=output&owner="+owner+"&projectName="+projectName, {
            method: "GET",
            credentials: 'include'
        })
        .then(async (res) => {
            if(res.status == 401){
                localStorage.removeItem("username");
                window.location.href="/"
            } else {
                const blob = await res.blob()
                setPdf(URL.createObjectURL(blob))
            }
        })
        .catch((err) => {
            console.log(err);
        });
    }

    async function compileLatex(){
        const response = await axios.post("http://localhost:8000/api/file/compilePDF", 
            {text: latexText, projectName: projectName, owner: owner},
            {withCredentials: true}
        );
        if(response.data === "Successfully compiled PDF"){
            getPDF();
            setErr("");
        } else {
            console.log(err);
            setErr(response.data);
        }
    }

    return (
        <div className='compilerPage'>
            <div className='compilerInfo'>
                <button className="btn btn-dark" onClick={compileLatex}>Compile</button>
            </div>
            {err !== "" ? <pre className='errMessage'>{err}</pre> : <iframe className='pdfRenderer' src={pdf}/>}
        </div>
    );

}

export default Compiler;