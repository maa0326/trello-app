package com.example.trello.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateListRequest(
        @NotBlank String title
) {
}
