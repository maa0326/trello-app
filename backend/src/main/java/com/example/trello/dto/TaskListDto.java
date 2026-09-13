package com.example.trello.dto;

import java.util.List;

public record TaskListDto(
        Long id,
        String title,
        int position,
        String sortMode,
        List<CardDto> cards
) {
}
