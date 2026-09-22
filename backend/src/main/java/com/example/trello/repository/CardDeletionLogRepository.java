package com.example.trello.repository;

import com.example.trello.entity.CardDeletionLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CardDeletionLogRepository extends JpaRepository<CardDeletionLog, Long> {
}
