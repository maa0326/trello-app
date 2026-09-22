package com.example.trello;

import com.example.trello.entity.Card;
import com.example.trello.entity.Priority;
import com.example.trello.entity.TaskList;
import com.example.trello.repository.CardDeletionLogRepository;
import com.example.trello.repository.CardRepository;
import com.example.trello.repository.TaskListRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 実際のPostgreSQLにデータを投入し、カード移動・ピン留め・削除ログ・存在しないIDへの
 * アクセス時のエラーレスポンスを確認する。
 */
@SpringBootTest
@AutoConfigureMockMvc
class BoardServiceIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TaskListRepository taskListRepository;

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private CardDeletionLogRepository cardDeletionLogRepository;

    private TaskList listA;
    private TaskList listB;
    private Card card1;

    @BeforeEach
    void setUp() {
        cardDeletionLogRepository.deleteAll();
        cardRepository.deleteAll();
        taskListRepository.deleteAll();

        listA = saveList("リストA", 0);
        listB = saveList("リストB", 1);

        card1 = saveCard(listA, "カード1", 0);
        saveCard(listA, "カード2", 1);
    }

    @AfterEach
    void tearDown() {
        cardDeletionLogRepository.deleteAll();
        cardRepository.deleteAll();
        taskListRepository.deleteAll();
    }

    private TaskList saveList(String title, int position) {
        TaskList list = new TaskList();
        list.setTitle(title);
        list.setPosition(position);
        return taskListRepository.save(list);
    }

    private Card saveCard(TaskList list, String title, int position) {
        Card card = new Card();
        card.setTitle(title);
        card.setPriority(Priority.MID);
        card.setPosition(position);
        card.setTaskList(list);
        return cardRepository.save(card);
    }

    @Test
    void カードを別リストへ移動できる() throws Exception {
        mockMvc.perform(put("/api/cards/" + card1.getId() + "/move")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"targetListId\":" + listB.getId() + ",\"targetPosition\":0}"))
                .andExpect(status().isNoContent());

        Card moved = cardRepository.findById(card1.getId()).orElseThrow();
        org.assertj.core.api.Assertions.assertThat(moved.getTaskList().getId()).isEqualTo(listB.getId());
    }

    @Test
    void カードをピン留めできる() throws Exception {
        mockMvc.perform(patch("/api/cards/" + card1.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"pinned\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pinned").value(true));
    }

    @Test
    void カード削除時に削除ログが記録される() throws Exception {
        mockMvc.perform(delete("/api/cards/" + card1.getId()))
                .andExpect(status().isNoContent());

        org.assertj.core.api.Assertions.assertThat(cardRepository.findById(card1.getId())).isEmpty();
        org.assertj.core.api.Assertions.assertThat(cardDeletionLogRepository.findAll())
                .anyMatch(log -> log.getCardId().equals(card1.getId()) && log.getTitle().equals("カード1"));
    }

    @Test
    void 存在しないリストIDを更新しようとすると404が返る() throws Exception {
        mockMvc.perform(patch("/api/lists/999999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"x\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void 不正なsortModeを指定すると400が返る() throws Exception {
        mockMvc.perform(patch("/api/lists/" + listA.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"sortMode\":\"invalid\"}"))
                .andExpect(status().isBadRequest());
    }
}
