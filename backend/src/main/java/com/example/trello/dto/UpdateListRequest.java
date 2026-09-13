package com.example.trello.dto;

public record UpdateListRequest(
        String title,
        String sortMode
) {
}
