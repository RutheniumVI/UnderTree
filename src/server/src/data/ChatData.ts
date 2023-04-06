/*
Author: Eesha Qureshi
Date: March 22, 2023
Purpose: Chat Data module, contains the data types for all chat related functionality that are used throughout the project
*/

export interface Message {
    room: string,
    username: string,
    message: string,
    time: Date,
    avatar: string,
    id: string,
}