import React from 'react';
import axios from 'axios';
import { useState, useEffect } from 'react';

import '../Styles/Compiler.css'

function Compiler(){

    const [latexText, setLatexText] = useState("");
    const [err, setErr] = useState("");

    const [pdf, setPdf] = useState("");

    useEffect(() => {
        getPDF()
    }, []);

    function getPDF(){
        fetch("http://localhost:8000/api/file/getPDF?file=output", {
            method: "GET",
            credentials: 'include'
        })
        .then(async (res) => {
            const blob = await res.blob()
            setPdf(URL.createObjectURL(blob))
        });
    }

    async function compileLatex(){
        const response = await axios.post("http://localhost:8000/api/file/compilePDF", {text: latexText});
        if(response.data === "Successfully compiled PDF"){
            getPDF();
        } else {
            console.log(err);
            setErr(response.data);
        }
    }

    return (
        <div className='compilerPage'>
            {/* Place holder textarea, remove once integrated with editor instead */}
            <textarea style={{width: "100%"}} onChange={(e) => {setLatexText(e.target.value)}}></textarea>
            <div className='compilerInfo'>
                <button class="btn btn-dark" onClick={compileLatex}>Compile</button>
            </div>
            {err !== "" ? <pre className='errMessage'>{err}</pre> : <iframe className='pdfRenderer' src={pdf}/>}
        </div>
    );

}

export default Compiler;