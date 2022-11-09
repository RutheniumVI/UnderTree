package com.capstoners.Undertree.realTime.editor.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class TextEditDelta {

    private String user;
    private String text;
    private int position;
    private int updatedCursorPosition;

}
