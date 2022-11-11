package com.capstoners.Undertree.realTime.editor.controller;

import com.capstoners.Undertree.realTime.editor.model.OperationTypes;
import com.capstoners.Undertree.realTime.editor.model.TextEditOperation;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class EditorController {

    @MessageMapping("/editor/trigger")
    @SendTo("/editor/init")
    public TextEditOperation onSubscribe(){
        TextEditOperation init = new TextEditOperation("bob", OperationTypes.INSERT, "hello world", 0);
        return init;
    }
}
