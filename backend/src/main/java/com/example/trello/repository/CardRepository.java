package com.example.trello.repository;

import com.example.trello.entity.Card;
import com.example.trello.entity.Priority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CardRepository extends JpaRepository<Card, Long> {

    @Query("""
            SELECT c FROM Card c
            WHERE (CAST(:keyword AS string) IS NULL
                OR LOWER(c.title) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))
                OR LOWER(c.description) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')))
            AND (:priority IS NULL OR c.priority = :priority)
            ORDER BY c.id ASC
            """)
    List<Card> search(@Param("keyword") String keyword, @Param("priority") Priority priority);
}
