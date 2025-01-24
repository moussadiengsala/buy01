package com.zone01.users;

import com.zone01.users.dto.UserDTO;
import com.zone01.users.user.UserRepository;
import com.zone01.users.user.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Optional;

@SpringBootTest
class UsersApplicationTests {

	@Autowired
	private UserService userService;

	@Test
	void contextLoads() {
		Optional<UserDTO> user = userService.getUserById("hello");
	}

}
