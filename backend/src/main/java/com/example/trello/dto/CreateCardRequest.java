package com.example.trello.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateCardRequest(
        @NotBlank String title
) {
}
