package com.zone01.users.user;

import com.zone01.users.config.JwtService;
import com.zone01.users.dto.UpdateUserDTO;
import com.zone01.users.dto.UserDTO;
import com.zone01.users.dto.UserLoginDTO;
import com.zone01.users.dto.UserRegistrationDTO;
import com.zone01.users.model.AuthenticationResponse;
import com.zone01.users.model.Response;
import com.zone01.users.model.Role;
import com.zone01.users.service.FileServices;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private FileServices fileServices;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private HttpServletRequest httpServletRequest;

    @Mock
    private MultipartFile multipartFile;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private UserDTO testUserDTO;
    private UserRegistrationDTO testRegistrationDTO;
    private UserLoginDTO testLoginDTO;
    private AuthenticationResponse testAuthResponse;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Setup test user
        testUser = User.builder()
                .id("123")
                .name("John Doe")
                .email("test@example.com")
                .password("encodedPassword")
                .role(Role.CLIENT)
                .avatar("avatar.jpg")
                .build();

        // Setup test DTOs
        testUserDTO = UserDTO.builder()
                .id("123")
                .name("John Doe")
                .email("test@example.com")
                .role(Role.CLIENT)
                .avatar("avatar.jpg")
                .build();

        testRegistrationDTO = UserRegistrationDTO.builder()
                .name("John Doe")
                .email("test@example.com")
                .password("Password123!")
                .role(Role.CLIENT)
                .build();

        testLoginDTO = UserLoginDTO.builder()
                .email("test@example.com")
                .password("Password123!")
                .build();

        testAuthResponse = AuthenticationResponse.builder()
                .accessToken("access-token")
                .refreshToken("refresh-token")
                .build();
    }

    // getUserById tests
    @Test
    void getUserById_Success() {
        when(userRepository.findById("123")).thenReturn(Optional.of(testUser));

        Optional<UserDTO> result = userService.getUserById("123");

        assertTrue(result.isPresent());
        assertEquals("123", result.get().getId());
        assertEquals("John Doe", result.get().getName());
        assertEquals("test@example.com", result.get().getEmail());
        assertEquals(Role.CLIENT, result.get().getRole());
        assertEquals("avatar.jpg", result.get().getAvatar());
    }

    @Test
    void getUserById_NotFound() {
        when(userRepository.findById("123")).thenReturn(Optional.empty());

        Optional<UserDTO> result = userService.getUserById("123");

        assertFalse(result.isPresent());
    }

    // createUser tests
    @Test
    void createUser_Success() {
        when(userRepository.findUserByEmail("test@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("Password123!")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtService.generateToken(any(User.class))).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any(User.class))).thenReturn("refresh-token");

        Response<Object> response = userService.createUser(testRegistrationDTO);

        assertEquals(HttpStatus.CREATED.value(), response.getStatus());
        assertEquals("user has been created successfully.", response.getMessage());
        assertNotNull(response.getData());
        AuthenticationResponse authResponse = (AuthenticationResponse) response.getData();
        assertEquals("access-token", authResponse.getAccessToken());
        assertEquals("refresh-token", authResponse.getRefreshToken());
    }

    @Test
    void createUser_DuplicateEmail() {
        when(userRepository.findUserByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        Response<Object> response = userService.createUser(testRegistrationDTO);

        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
        assertEquals("Email already in use.", response.getMessage());
        assertNull(response.getData());
    }

    @Test
    void createUser_WithAvatar_Success() throws IOException {
        testRegistrationDTO.setAvatar(multipartFile);
        testRegistrationDTO.setRole(Role.SELLER);

        when(userRepository.findUserByEmail("test@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("Password123!")).thenReturn("encodedPassword");
        when(fileServices.validateFile(any(MultipartFile.class))).thenReturn(null);
        when(fileServices.saveFile(any(MultipartFile.class))).thenReturn("avatar.jpg");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtService.generateToken(any(User.class))).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any(User.class))).thenReturn("refresh-token");

        Response<Object> response = userService.createUser(testRegistrationDTO);

        assertEquals(HttpStatus.CREATED.value(), response.getStatus());
        assertEquals("user has been created successfully.", response.getMessage());
        assertNotNull(response.getData());
    }

    @Test
    void createUser_WithAvatar_ValidationError() throws IOException {
        testRegistrationDTO.setAvatar(multipartFile);
        testRegistrationDTO.setRole(Role.SELLER);

        Response<Object> validationError = Response.<Object>builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message("Invalid file format")
                .build();

        when(userRepository.findUserByEmail("test@example.com")).thenReturn(Optional.empty());
        when(fileServices.validateFile(any(MultipartFile.class))).thenReturn(validationError);

        Response<Object> response = userService.createUser(testRegistrationDTO);

        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
        assertEquals("Invalid file format", response.getMessage());
    }

    @Test
    void createUser_WithAvatar_IOException() throws IOException {
        testRegistrationDTO.setAvatar(multipartFile);
        testRegistrationDTO.setRole(Role.SELLER);

        when(userRepository.findUserByEmail("test@example.com")).thenReturn(Optional.empty());
        when(fileServices.validateFile(any(MultipartFile.class))).thenReturn(null);
        when(fileServices.saveFile(any(MultipartFile.class))).thenThrow(new IOException("File error"));

        Response<Object> response = userService.createUser(testRegistrationDTO);

        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
        assertEquals("File error", response.getMessage());
    }

    // authenticate tests
    @Test
    void authenticate_Success() {
        when(userRepository.findUserByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        doNothing().when(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        when(jwtService.generateToken(any(User.class))).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any(User.class))).thenReturn("refresh-token");

        Response<AuthenticationResponse> response = userService.authenticate(testLoginDTO);

        assertEquals(HttpStatus.OK.value(), response.getStatus());
        assertEquals("user has been authenticated successfully.", response.getMessage());
        assertNotNull(response.getData());
        assertEquals("access-token", response.getData().getAccessToken());
        assertEquals("refresh-token", response.getData().getRefreshToken());
    }

    @Test
    void authenticate_EmailNotFound() {
        when(userRepository.findUserByEmail("test@example.com")).thenReturn(Optional.empty());

        Response<AuthenticationResponse> response = userService.authenticate(testLoginDTO);

        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
        assertEquals("Email does not exist.", response.getMessage());
        assertNull(response.getData());
    }

    @Test
    void authenticate_InvalidCredentials() {
        when(userRepository.findUserByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        doThrow(new BadCredentialsException("Invalid credentials"))
                .when(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));

        Response<AuthenticationResponse> response = userService.authenticate(testLoginDTO);

        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
        assertTrue(response.getMessage().contains("Invalid credentials"));
    }

    // updateUser tests
    @Test
    void updateUser_Success() {
        UpdateUserDTO updateUserDTO = mock(UpdateUserDTO.class);
        when(userRepository.findById("123")).thenReturn(Optional.of(testUser));
        when(updateUserDTO.applyUpdates(any(), any(), any())).thenReturn(null);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        Response<Object> response = userService.updateUser("123", updateUserDTO);

        assertEquals(HttpStatus.OK.value(), response.getStatus());
        assertEquals("User updated successfully", response.getMessage());
        assertNotNull(response.getData());
        UserDTO updatedUser = (UserDTO) response.getData();
        assertEquals("123", updatedUser.getId());
    }

    @Test
    void updateUser_UserNotFound() {
        UpdateUserDTO updateUserDTO = mock(UpdateUserDTO.class);
        when(userRepository.findById("123")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> {
            userService.updateUser("123", updateUserDTO);
        });
    }

    @Test
    void updateUser_ValidationError() {
        UpdateUserDTO updateUserDTO = mock(UpdateUserDTO.class);
        Response<Object> validationError = Response.<Object>builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message("Invalid update data")
                .build();

        when(userRepository.findById("123")).thenReturn(Optional.of(testUser));
        when(updateUserDTO.applyUpdates(any(), any(), any())).thenReturn(validationError);

        Response<Object> response = userService.updateUser("123", updateUserDTO);

        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
        assertEquals("Invalid update data", response.getMessage());
    }

    // deleteUser tests
    @Test
    void deleteUser_Success() {
        when(userRepository.findById("123")).thenReturn(Optional.of(testUser));
        doNothing().when(userRepository).deleteById("123");

        Response<Object> response = userService.deleteUser("123");

        assertEquals(HttpStatus.OK.value(), response.getStatus());
        assertEquals("User deleted successfully", response.getMessage());
        assertNotNull(response.getData());
//        assertEquals("123", response.getData().getId());
    }

    @Test
    void deleteUser_UserNotFound() {
        when(userRepository.findById("123")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> {
            userService.deleteUser("123");
        });
    }

    // getAllUsers tests
    @Test
    void getAllUsers_Success() {
        List<User> users = Arrays.asList(testUser);
        when(userRepository.findAll()).thenReturn(users);

        Response<List<UserDTO>> response = userService.getAllUsers();

        assertEquals(200, response.getStatus());
        assertEquals("success", response.getMessage());
        assertNotNull(response.getData());
        assertEquals(1, response.getData().size());
        assertEquals("123", response.getData().get(0).getId());
    }

    @Test
    void getAllUsers_Empty() {
        when(userRepository.findAll()).thenReturn(Arrays.asList());

        Response<List<UserDTO>> response = userService.getAllUsers();

        assertEquals(200, response.getStatus());
        assertEquals("success", response.getMessage());
        assertNotNull(response.getData());
        assertTrue(response.getData().isEmpty());
    }

    // refreshToken tests
    @Test
    void refreshToken_Success() {
        Map<String, Object> extractedData = new HashMap<>();
        extractedData.put("data", "test@example.com");

        when(httpServletRequest.getHeader(HttpHeaders.AUTHORIZATION)).thenReturn("Bearer refresh-token");
        when(jwtService.extractUsername("refresh-token")).thenReturn(extractedData);
        when(userRepository.findUserByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(jwtService.generateToken(any(User.class))).thenReturn("new-access-token");
        when(jwtService.generateRefreshToken(any(User.class))).thenReturn("new-refresh-token");

        Response<AuthenticationResponse> response = userService.refreshToken(httpServletRequest);

        assertEquals(HttpStatus.OK.value(), response.getStatus());
        assertNotNull(response.getData());
        assertEquals("new-access-token", response.getData().getAccessToken());
        assertEquals("new-refresh-token", response.getData().getRefreshToken());
    }

    @Test
    void refreshToken_MissingHeader() {
        when(httpServletRequest.getHeader(HttpHeaders.AUTHORIZATION)).thenReturn(null);

        Response<AuthenticationResponse> response = userService.refreshToken(httpServletRequest);

        assertEquals(HttpStatus.UNAUTHORIZED.value(), response.getStatus());
        assertEquals("Authorization header is missing or invalid", response.getMessage());
        assertNull(response.getData());
    }

    @Test
    void refreshToken_InvalidToken() {
        Map<String, Object> extractedData = new HashMap<>();
        extractedData.put("error", "Invalid token");

        when(httpServletRequest.getHeader(HttpHeaders.AUTHORIZATION)).thenReturn("Bearer refresh-token");
        when(jwtService.extractUsername("refresh-token")).thenReturn(extractedData);

        Response<AuthenticationResponse> response = userService.refreshToken(httpServletRequest);

        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
        assertEquals("Invalid token", response.getMessage());
        assertNull(response.getData());
    }

    @Test
    void refreshToken_UserNotFound() {
        Map<String, Object> extractedData = new HashMap<>();
        extractedData.put("data", "test@example.com");

        when(httpServletRequest.getHeader(HttpHeaders.AUTHORIZATION)).thenReturn("Bearer refresh-token");
        when(jwtService.extractUsername("refresh-token")).thenReturn(extractedData);
        when(userRepository.findUserByEmail("test@example.com")).thenReturn(Optional.empty());

        Response<AuthenticationResponse> response = userService.refreshToken(httpServletRequest);

        assertEquals(HttpStatus.NOT_FOUND.value(), response.getStatus());
        assertEquals("User not found", response.getMessage());
        assertNull(response.getData());
    }

    // getUserAvatar tests
    @Test
    void getUserAvatar_Success() {
        Response<Object> expectedResponse = Response.<Object>builder()
                .status(HttpStatus.OK.value())
                .message("Avatar retrieved successfully")
                .build();

        when(fileServices.getAvatar("avatar.jpg")).thenReturn(expectedResponse);

        Response<Object> response = userService.getUserAvatar("avatar.jpg");

        assertEquals(HttpStatus.OK.value(), response.getStatus());
        assertEquals("Avatar retrieved successfully", response.getMessage());
    }
} 