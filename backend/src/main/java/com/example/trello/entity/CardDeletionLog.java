package com.example.trello.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "card_deletion_logs")
@Getter
@Setter
@NoArgsConstructor
public class CardDeletionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long cardId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private Instant deletedAt = Instant.now();

    public CardDeletionLog(Long cardId, String title) {
        this.cardId = cardId;
        this.title = title;
    }
}
