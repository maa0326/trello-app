package com.example.trello.dto;

public record ErrorResponse(
        int status,
        String message
) {
}
