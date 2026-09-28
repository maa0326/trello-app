package com.example.trello.config;

import com.example.trello.entity.TaskList;
import com.example.trello.entity.User;
import com.example.trello.repository.TaskListRepository;
import com.example.trello.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

/**
 * アカウントごとのボード分離(owner紐付け)を導入する前に作成されたリストは
 * 誰にも紐付いていない(owner=null)ため、最も古く作成されたユーザーに
 * 割り当てて表示できるようにする。owner未設定のリストがなくなれば以降は何もしない。
 */
@Component
@RequiredArgsConstructor
public class LegacyDataMigration implements CommandLineRunner {

    private final TaskListRepository taskListRepository;
    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        List<TaskList> orphaned = taskListRepository.findAllByOwnerIsNull();
        if (orphaned.isEmpty()) {
            return;
        }

        userRepository.findAll().stream()
                .min(Comparator.comparing(User::getCreatedAt))
                .ifPresent(owner -> {
                    orphaned.forEach(list -> list.setOwner(owner));
                    taskListRepository.saveAll(orphaned);
                });
    }
}
