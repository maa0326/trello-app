package com.example.trello.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "task_lists")
@Getter
@Setter
@NoArgsConstructor
public class TaskList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private int position;

    @Column(nullable = false)
    private String sortMode = "manual";

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean pinned = false;

    private Instant pinnedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    @OneToMany(mappedBy = "taskList", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<Card> cards = new ArrayList<>();
}
