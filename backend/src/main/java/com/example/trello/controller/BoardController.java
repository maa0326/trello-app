package com.example.trello.controller;

import com.example.trello.dto.*;
import com.example.trello.entity.Priority;
import com.example.trello.service.BoardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    @GetMapping("/lists")
    public List<TaskListDto> getBoard() {
        return boardService.getBoard();
    }

    @PostMapping("/lists")
    @ResponseStatus(HttpStatus.CREATED)
    public TaskListDto createList(@Valid @RequestBody CreateListRequest request) {
        return boardService.createList(request);
    }

    @PutMapping("/lists/{listId}")
    public TaskListDto updateList(@PathVariable Long listId, @RequestBody UpdateListRequest request) {
        return boardService.updateList(listId, request);
    }

    @DeleteMapping("/lists/{listId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteList(@PathVariable Long listId) {
        boardService.deleteList(listId);
    }

    @PostMapping("/lists/{listId}/cards")
    @ResponseStatus(HttpStatus.CREATED)
    public CardDto createCard(@PathVariable Long listId, @Valid @RequestBody CreateCardRequest request) {
        return boardService.createCard(listId, request);
    }

    @PutMapping("/cards/{cardId}")
    public CardDto updateCard(@PathVariable Long cardId, @RequestBody UpdateCardRequest request) {
        return boardService.updateCard(cardId, request);
    }

    @DeleteMapping("/cards/{cardId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCard(@PathVariable Long cardId) {
        boardService.deleteCard(cardId);
    }

    @PutMapping("/cards/{cardId}/move")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void moveCard(@PathVariable Long cardId, @Valid @RequestBody MoveCardRequest request) {
        boardService.moveCard(cardId, request);
    }

    @GetMapping("/cards/search")
    public List<CardDto> searchCards(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Priority priority
    ) {
        return boardService.searchCards(keyword, priority);
    }
}
