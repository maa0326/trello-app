package com.example.trello.service;

import com.example.trello.dto.*;
import com.example.trello.entity.Card;
import com.example.trello.entity.CardDeletionLog;
import com.example.trello.entity.Priority;
import com.example.trello.entity.TaskList;
import com.example.trello.repository.CardDeletionLogRepository;
import com.example.trello.repository.CardRepository;
import com.example.trello.repository.TaskListRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BoardService {

    private final TaskListRepository taskListRepository;
    private final CardRepository cardRepository;
    private final CardDeletionLogRepository cardDeletionLogRepository;

    public List<TaskListDto> getBoard() {
        return taskListRepository.findAllByOrderByPositionAsc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    public TaskListDto createList(CreateListRequest request) {
        int nextPosition = taskListRepository.findAllByOrderByPositionAsc().size();
        TaskList list = new TaskList();
        list.setTitle(request.title());
        list.setPosition(nextPosition);
        return toDto(taskListRepository.save(list));
    }

    public TaskListDto updateList(Long listId, UpdateListRequest request) {
        TaskList list = getListOrThrow(listId);
        if (request.title() != null && !request.title().isBlank()) {
            list.setTitle(request.title());
        }
        if (request.sortMode() != null) {
            list.setSortMode(request.sortMode());
        }
        return toDto(taskListRepository.save(list));
    }

    public void deleteList(Long listId) {
        taskListRepository.deleteById(listId);
    }

    public CardDto createCard(Long listId, CreateCardRequest request) {
        TaskList list = getListOrThrow(listId);
        Card card = new Card();
        card.setTitle(request.title());
        card.setPosition(list.getCards().size());
        card.setTaskList(list);
        return toDto(cardRepository.save(card));
    }

    public CardDto updateCard(Long cardId, UpdateCardRequest request) {
        Card card = getCardOrThrow(cardId);
        if (request.title() != null && !request.title().isBlank()) {
            card.setTitle(request.title());
        }
        if (request.description() != null) {
            card.setDescription(request.description());
        }
        if (request.dueDate() != null) {
            card.setDueDate(request.dueDate());
        }
        if (request.priority() != null) {
            card.setPriority(request.priority());
        }
        if (request.pinned() != null) {
            card.setPinned(request.pinned());
            card.setPinnedAt(request.pinned() ? Instant.now() : null);
        }
        return toDto(cardRepository.save(card));
    }

    public void deleteCard(Long cardId) {
        Card card = getCardOrThrow(cardId);
        cardDeletionLogRepository.save(new CardDeletionLog(card.getId(), card.getTitle()));
        cardRepository.deleteById(cardId);
    }

    public List<CardDto> searchCards(String keyword, Priority priority) {
        return cardRepository.search(keyword, priority)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public void moveCard(Long cardId, MoveCardRequest request) {
        Card card = getCardOrThrow(cardId);
        TaskList sourceList = card.getTaskList();
        TaskList targetList = getListOrThrow(request.targetListId());

        // TaskList.cards は orphanRemoval=true のため、collection の remove/add 経由で
        // 付け替えるとHibernateがsourceList側の除去を「孤立」と見なして物理削除してしまう。
        // そのためCard自体のposition/taskListを直接更新し、collectionには触れない。
        List<Card> sourceCards = new ArrayList<>(sourceList.getCards());
        sourceCards.removeIf(c -> c.getId().equals(cardId));
        reindex(sourceCards);
        cardRepository.saveAll(sourceCards);

        List<Card> targetCards = sourceList.getId().equals(targetList.getId())
                ? sourceCards
                : new ArrayList<>(targetList.getCards());
        int insertAt = Math.max(0, Math.min(request.targetPosition(), targetCards.size()));
        targetCards.add(insertAt, card);
        card.setTaskList(targetList);
        reindex(targetCards);
        cardRepository.saveAll(targetCards);
    }

    private void reindex(List<Card> cards) {
        for (int i = 0; i < cards.size(); i++) {
            cards.get(i).setPosition(i);
        }
    }

    private TaskList getListOrThrow(Long id) {
        return taskListRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("List not found: " + id));
    }

    private Card getCardOrThrow(Long id) {
        return cardRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Card not found: " + id));
    }

    private TaskListDto toDto(TaskList list) {
        List<CardDto> cardDtos = list.getCards().stream()
                .map(this::toDto)
                .toList();
        return new TaskListDto(list.getId(), list.getTitle(), list.getPosition(), list.getSortMode(), cardDtos);
    }

    private CardDto toDto(Card card) {
        return new CardDto(
                card.getId(),
                card.getTitle(),
                card.getDescription(),
                card.getDueDate(),
                card.getPriority(),
                card.getPosition(),
                card.getCreatedAt().toEpochMilli(),
                card.isPinned(),
                card.getPinnedAt() != null ? card.getPinnedAt().toEpochMilli() : null
        );
    }
}
