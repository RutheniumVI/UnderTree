package com.capstoners.Undertree.chat.model;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ChatMessage {

    private String user;
    private String message;

}