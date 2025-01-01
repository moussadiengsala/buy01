package com.zone01.users;

import com.zone01.users.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.kafka.core.KafkaTemplate;

@SpringBootApplication
public class UsersApplication {

	public static void main(String[] args) {
		SpringApplication.run(UsersApplication.class, args);
	}

//	@Bean
//	CommandLineRunner commandLineRunner(KafkaTemplate<String, String> kafkaTemplate) {
//		return args -> {
//			for (int i = 0; i < 10; i++) {
//				kafkaTemplate.send("users-topic", String.format("kafka test :) - %d", i));
//			}
//		};
//	}

}
