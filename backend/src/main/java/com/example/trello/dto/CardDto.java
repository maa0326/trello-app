package com.example.trello.dto;

import com.example.trello.entity.Priority;

import java.time.LocalDate;

public record CardDto(
        Long id,
        String title,
        String description,
        LocalDate dueDate,
        Priority priority,
        int position,
        long createdAt
) {
}
