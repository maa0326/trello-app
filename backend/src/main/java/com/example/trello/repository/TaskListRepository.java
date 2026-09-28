package com.example.trello.repository;

import com.example.trello.entity.TaskList;
import com.example.trello.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskListRepository extends JpaRepository<TaskList, Long> {
    List<TaskList> findAllByOrderByPositionAsc();

    List<TaskList> findAllByOwnerOrderByPositionAsc(User owner);
}
