package com.example.trello;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration;

@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class TrelloBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(TrelloBackendApplication.class, args);
	}

}
