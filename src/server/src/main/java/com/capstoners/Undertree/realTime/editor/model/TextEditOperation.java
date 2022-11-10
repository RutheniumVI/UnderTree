package com.capstoners.Undertree.realTime.editor.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class TextEditOperation {

    private String user;
    private OperationTypes operation;
    private String editedText;
    private int editPosition;

}
