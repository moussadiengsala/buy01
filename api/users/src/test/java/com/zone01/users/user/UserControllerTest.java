package com.zone01.users.user;

import com.zone01.users.dto.UserDTO;
import com.zone01.users.dto.UserLoginDTO;
import com.zone01.users.dto.UserRegistrationDTO;
import com.zone01.users.model.AuthenticationResponse;
import com.zone01.users.model.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.*;

class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createUser_Success() {
        UserRegistrationDTO registrationDTO = UserRegistrationDTO.builder()
                .name("John Doe")
                .email("test@example.com")
                .password("Password123!")
                .build();

        Response<Object> expectedResponse = Response.<Object>builder()
                .status(HttpStatus.CREATED.value())
                .message("user has been created successfully.")
                .build();
        
        when(userService.createUser(any(UserRegistrationDTO.class))).thenReturn(expectedResponse);
        
        ResponseEntity<Response<Object>> response = userController.createUser(registrationDTO);
        
        assertEquals(HttpStatus.CREATED.value(), response.getBody().getStatus());
        assertEquals("user has been created successfully.", response.getBody().getMessage());
    }

    @Test
    void authenticate_Success() {
        UserLoginDTO loginDTO = UserLoginDTO.builder()
                .email("test@example.com")
                .password("Password123!")
                .build();

        AuthenticationResponse authResponse = AuthenticationResponse.builder()
                .accessToken("valid-token")
                .refreshToken("refresh-token")
                .build();

        Response<AuthenticationResponse> expectedResponse = Response.<AuthenticationResponse>builder()
                .status(HttpStatus.OK.value())
                .data(authResponse)
                .message("user has been authenticated successfully.")
                .build();
        
        when(userService.authenticate(any(UserLoginDTO.class))).thenReturn(expectedResponse);
        
        ResponseEntity<Response<AuthenticationResponse>> response = userController.authenticate(loginDTO);
        
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        assertNotNull(response.getBody().getData());
        assertEquals("valid-token", response.getBody().getData().getAccessToken());
    }

    @Test
    void getUserById_Success() {
        String userId = "123";
        UserDTO userDTO = UserDTO.builder()
                .id(userId)
                .name("John Doe")
                .email("test@example.com")
                .build();

        when(userService.getUserById(userId)).thenReturn(Optional.of(userDTO));
        
        ResponseEntity<Response<UserDTO>> response = userController.getUserById(userId);
        
        assertEquals(HttpStatus.OK.value(), response.getBody().getStatus());
        assertEquals("success", response.getBody().getMessage());
        assertNotNull(response.getBody().getData());
        assertEquals(userId, response.getBody().getData().getId());
    }

    @Test
    void getUserById_NotFound() {
        String userId = "123";
        
        when(userService.getUserById(userId)).thenReturn(Optional.empty());
        
        ResponseEntity<Response<UserDTO>> response = userController.getUserById(userId);
        
        assertEquals(HttpStatus.NOT_FOUND.value(), response.getBody().getStatus());
        assertEquals("User not found", response.getBody().getMessage());
    }
} 