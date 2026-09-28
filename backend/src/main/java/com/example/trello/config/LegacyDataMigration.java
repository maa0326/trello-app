package com.example.trello.config;

import com.example.trello.entity.TaskList;
import com.example.trello.repository.TaskListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * アカウントごとのボード分離(owner紐付け)を導入する前に作成されたリストは
 * 誰にも紐付いていない(owner=null)ため、お試し利用時の共有データとして削除する。
 * owner未設定のリストがなくなれば以降は何もしない。
 */
@Component
@RequiredArgsConstructor
public class LegacyDataMigration implements CommandLineRunner {

    private final TaskListRepository taskListRepository;

    @Override
    public void run(String... args) {
        List<TaskList> orphaned = taskListRepository.findAllByOwnerIsNull();
        if (orphaned.isEmpty()) {
            return;
        }
        taskListRepository.deleteAll(orphaned);
    }
}
