package com.example.trello.dto;

import jakarta.validation.constraints.Pattern;

public record UpdateListRequest(
        String title,
        @Pattern(regexp = "manual|priority|newest", message = "sortModeはmanual/priority/newestのいずれかである必要があります")
        String sortMode
) {
}
