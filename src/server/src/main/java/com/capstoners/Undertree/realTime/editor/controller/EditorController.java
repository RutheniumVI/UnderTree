package com.capstoners.Undertree.realTime.editor.controller;

import com.capstoners.Undertree.realTime.editor.model.TextEditDelta;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class EditorController {

    @MessageMapping("editor/trigger")
    @SendTo("/editor/init")
    public TextEditDelta onSubscribe(){
        TextEditDelta init = new TextEditDelta("bob", "hello world", 0, 3);
        return init;
    }
}
