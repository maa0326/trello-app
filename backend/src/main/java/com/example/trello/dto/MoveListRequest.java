package com.example.trello.dto;

import jakarta.validation.constraints.NotNull;

public record MoveListRequest(
        @NotNull Integer targetPosition
) {
}
