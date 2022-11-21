package com.capstoners.Undertree.chat.controller;

import com.capstoners.Undertree.chat.model.ChatMessage;
import com.capstoners.Undertree.realTime.editor.model.OperationTypes;
import com.capstoners.Undertree.realTime.editor.model.TextEditOperation;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @MessageMapping("/chat/send")
    @SendTo("/chat/receive")
    public ChatMessage onSubscribe(ChatMessage msg){
        return msg;
    }
}
