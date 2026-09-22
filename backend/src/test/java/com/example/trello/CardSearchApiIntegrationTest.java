package com.example.trello;

import com.example.trello.entity.Card;
import com.example.trello.entity.Priority;
import com.example.trello.entity.TaskList;
import com.example.trello.repository.CardRepository;
import com.example.trello.repository.TaskListRepository;
import com.example.trello.security.JwtService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * 実際のPostgreSQLにデータを投入し、検索APIがそのデータを正しく取得できることを確認する。
 * application.properties の設定(localhost:5432/trello_app)に接続する。
 */
@SpringBootTest
@AutoConfigureMockMvc
class CardSearchApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TaskListRepository taskListRepository;

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private JwtService jwtService;

    private TaskList list;

    private MockHttpServletRequestBuilder authed(MockHttpServletRequestBuilder builder) {
        return builder.header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtService.generateToken("test-user"));
    }

    @BeforeEach
    void setUp() {
        cardRepository.deleteAll();
        taskListRepository.deleteAll();

        list = new TaskList();
        list.setTitle("検索テスト用リスト");
        list.setPosition(0);
        list = taskListRepository.save(list);

        saveCard("請求書を作成する", "月末までに経理へ提出", Priority.HIGH, 0);
        saveCard("会議室を予約する", "来週の定例会議用", Priority.LOW, 1);
        saveCard("請求書の控えを保管する", null, Priority.MID, 2);
    }

    @AfterEach
    void tearDown() {
        cardRepository.deleteAll();
        taskListRepository.deleteAll();
    }

    private void saveCard(String title, String description, Priority priority, int position) {
        Card card = new Card();
        card.setTitle(title);
        card.setDescription(description);
        card.setPriority(priority);
        card.setPosition(position);
        card.setTaskList(list);
        cardRepository.save(card);
    }

    @Test
    void キーワード検索でPostgreSQLに保存したカードが取得できる() throws Exception {
        mockMvc.perform(authed(get("/api/cards/search").param("keyword", "請求書")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[*].title", containsInAnyOrder("請求書を作成する", "請求書の控えを保管する")));
    }

    @Test
    void 優先度検索でPostgreSQLに保存したカードが取得できる() throws Exception {
        mockMvc.perform(authed(get("/api/cards/search").param("priority", "HIGH")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("請求書を作成する"));
    }

    @Test
    void キーワード未指定なら全件返す() throws Exception {
        mockMvc.perform(authed(get("/api/cards/search")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)));
    }
}
