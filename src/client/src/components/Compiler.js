import React from 'react';
import axios from 'axios';
import { useState } from 'react';

import '../Styles/Compiler.css'

function Compiler(){

    const [latexText, setLatexText] = useState("");
    const [renderPDF, setRenderTime] = useState("");
    const [err, setErr] = useState("");

    async function compileLatex(){
        const response = await axios.post("http://localhost:8000/api/file/compilePDF", {text: latexText});
        if(response.data === "Successfully compiled PDF"){
            setRenderTime(new Date());
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
            {err !== "" ? <pre className='errMessage'>{err}</pre> : <iframe className='pdfRenderer' key={renderPDF} src="http://localhost:8000/api/file/getPDF?file=output"/>}
        </div>
    );

}

export default Compiler;