package com.example.trello.dto;

import com.example.trello.entity.Priority;

import java.time.LocalDate;

public record UpdateCardRequest(
        String title,
        String description,
        LocalDate dueDate,
        Priority priority,
        Boolean pinned
) {
}
