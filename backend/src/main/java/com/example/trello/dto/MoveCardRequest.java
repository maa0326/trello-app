package com.example.trello.dto;

import jakarta.validation.constraints.NotNull;

public record MoveCardRequest(
        @NotNull Long targetListId,
        @NotNull Integer targetPosition
) {
}
