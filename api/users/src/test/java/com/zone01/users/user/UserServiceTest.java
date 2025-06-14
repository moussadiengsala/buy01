package com.zone01.users.user;

import com.zone01.users.config.JwtService;
import com.zone01.users.config.kafka.ProductServices;
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
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

//@SpringBootTest
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
    @Mock
    private ProductServices productServices;

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

    @Test
    void getUserById_Success() {
        System.out.println("--------------------------------------------------------------");
        System.out.println("testing getUserById_Success");
        System.out.println("--------------------------------------------------------------");

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
        System.out.println("--------------------------------------------------------------");
        System.out.println("testing getUserById_NotFound");
        System.out.println("--------------------------------------------------------------");

        when(userRepository.findById("123")).thenReturn(Optional.empty());
        Optional<UserDTO> result = userService.getUserById("123");
        assertFalse(result.isPresent());
    }

    @Test
    void createUser_Success() {
        System.out.println("--------------------------------------------------------------");
        System.out.println("testing createUser_Success");
        System.out.println("--------------------------------------------------------------");

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
        System.out.println("--------------------------------------------------------------");
        System.out.println("testing createUser_DuplicateEmail");
        System.out.println("--------------------------------------------------------------");

        when(userRepository.findUserByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        Response<Object> response = userService.createUser(testRegistrationDTO);

        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
        assertEquals("Email already in use.", response.getMessage());
        assertNull(response.getData());
    }

    @Test
    void createUser_WithAvatar_Success() throws IOException {
        System.out.println("--------------------------------------------------------------");
        System.out.println("testing createUser_WithAvatar_Success");
        System.out.println("--------------------------------------------------------------");

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
        System.out.println("--------------------------------------------------------------");
        System.out.println("testing createUser_WithAvatar_ValidationError");
        System.out.println("--------------------------------------------------------------");

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
        System.out.println("--------------------------------------------------------------");
        System.out.println("testing createUser_WithAvatar_IOException");
        System.out.println("--------------------------------------------------------------");

        testRegistrationDTO.setAvatar(multipartFile);
        testRegistrationDTO.setRole(Role.SELLER);

        when(userRepository.findUserByEmail("test@example.com")).thenReturn(Optional.empty());
        when(fileServices.validateFile(any(MultipartFile.class))).thenReturn(null);
        when(fileServices.saveFile(any(MultipartFile.class))).thenThrow(new IOException("File error"));

        Response<Object> response = userService.createUser(testRegistrationDTO);

        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
        assertEquals("File error", response.getMessage());
    }

    @Test
    void authenticate_Success() {
        System.out.println("--------------------------------------------------------------");
        System.out.println("testing authenticate_Success");
        System.out.println("--------------------------------------------------------------");

        when(userRepository.findUserByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(new UsernamePasswordAuthenticationToken("user", "password"));
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
        System.out.println("--------------------------------------------------------------");
        System.out.println("testing authenticate_EmailNotFound");
        System.out.println("--------------------------------------------------------------");

        when(userRepository.findUserByEmail("test@example.com")).thenReturn(Optional.empty());

        Response<AuthenticationResponse> response = userService.authenticate(testLoginDTO);

        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
        assertEquals("Email does not exist.", response.getMessage());
        assertNull(response.getData());
    }

    @Test
    void authenticate_InvalidCredentials() {
        System.out.println("--------------------------------------------------------------");
        System.out.println("testing authenticate_InvalidCredentials");
        System.out.println("--------------------------------------------------------------");

        when(userRepository.findUserByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        doThrow(new BadCredentialsException("Invalid credentials"))
                .when(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));

        BadCredentialsException exception = assertThrows(
                BadCredentialsException.class,
                () -> userService.authenticate(testLoginDTO)
        );

        assertEquals("Invalid credentials", exception.getMessage());
    }

    @Test
    void updateUser_Success() {
        System.out.println("--------------------------------------------------------------");
        System.out.println("testing updateUser_Success");
        System.out.println("--------------------------------------------------------------");

        UpdateUserDTO updateUserDTO = mock(UpdateUserDTO.class);

        when(userRepository.findById("123")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);  // Assuming save returns User entity
        when(jwtService.generateRefreshToken(any(User.class))).thenReturn("refresh-token");
        when(jwtService.generateToken(any(User.class))).thenReturn("access-token");

        // Now simulate the userService mapping testUser into UserDTO
        Response<Object> response = userService.updateUser("123", updateUserDTO);
        AuthenticationResponse result = (AuthenticationResponse) response.getData();

        assertEquals(HttpStatus.OK.value(), response.getStatus());
        assertEquals("Your informations has been updated successfully.", response.getMessage());
        assertNotNull(response.getData());
        assertEquals("access-token", result.getAccessToken());
        assertEquals("refresh-token", result.getRefreshToken());
    }


    @Test
    void updateUser_UserNotFound() {
        System.out.println("--------------------------------------------------------------");
        System.out.println("testing updateUser_UserNotFound");
        System.out.println("--------------------------------------------------------------");

        UpdateUserDTO updateUserDTO = mock(UpdateUserDTO.class);
        when(userRepository.findById("123")).thenReturn(Optional.empty());

        IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class, () -> {
            userService.updateUser("123", updateUserDTO);
        });

        assertTrue(thrown.getMessage().contains("User not found"));
    }

    @Test
    void updateUser_ValidationError() {
        System.out.println("--------------------------------------------------------------");
        System.out.println("testing createUser_WithAvatar_IOException");
        System.out.println("--------------------------------------------------------------");


        UpdateUserDTO updateUserDTO = mock(UpdateUserDTO.class);
        Response<Object> validationError = Response.<Object>builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message("Invalid update data")
                .build();

        when(userRepository.findById("123")).thenReturn(Optional.of(testUser));
        when(updateUserDTO.applyUpdates(eq(passwordEncoder), eq(testUser), eq(fileServices))).thenReturn(validationError);

        Response<Object> response = userService.updateUser("123", updateUserDTO);

        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
        assertEquals("Invalid update data", response.getMessage());

        verify(userRepository, never()).save(any(User.class));

    }

    @Test
    @DisplayName("Should delete user successfully")
    void deleteUser_Success() {
        when(userRepository.findById("123")).thenReturn(Optional.of(testUser));
        when(productServices.deleteProductRelatedToUser("123")).thenReturn(null);
        doNothing().when(userRepository).deleteById("123");

        Response<Object> response = userService.deleteUser("123");

        assertEquals(HttpStatus.OK.value(), response.getStatus());
        assertEquals("User deleted successfully", response.getMessage());
        assertNotNull(response.getData());
        UserDTO deletedUser = (UserDTO) response.getData();
        assertEquals("123", deletedUser.getId());

        verify(userRepository).deleteById("123");
    }

    @Test
    @DisplayName("Should handle product service error")
    void deleteUser_ProductServiceError() {
        Response<Object> productError = Response.<Object>builder()
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .message("Failed to delete related products")
                .build();

        when(userRepository.findById("123")).thenReturn(Optional.of(testUser));
        when(productServices.deleteProductRelatedToUser("123")).thenReturn(productError);

        Response<Object> response = userService.deleteUser("123");

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR.value(), response.getStatus());
        assertEquals("Failed to delete related products", response.getMessage());

        verify(userRepository, never()).deleteById(anyString());
    }

    @Test
    @DisplayName("Should throw exception when user is not found")
    void deleteUser_UserNotFound() {
        when(userRepository.findById("123")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> {
            userService.deleteUser("123");
        });
    }

    // getAllUsers tests
    @Test
    @DisplayName("Should return all users successfully")
    void getAllUsers_Success() {
        List<User> users = Collections.singletonList(testUser);
        when(userRepository.findAll()).thenReturn(users);

        Response<List<UserDTO>> response = userService.getAllUsers();

        assertEquals(200, response.getStatus());
        assertEquals("success", response.getMessage());
        assertNotNull(response.getData());
        assertEquals(1, response.getData().size());
        assertEquals("123", response.getData().get(0).getId());
    }

    @Test
    @DisplayName("Should return empty list when no users exist")
    void getAllUsers_Empty() {
        when(userRepository.findAll()).thenReturn(Collections.emptyList());

        Response<List<UserDTO>> response = userService.getAllUsers();

        assertEquals(200, response.getStatus());
        assertEquals("success", response.getMessage());
        assertNotNull(response.getData());
        assertTrue(response.getData().isEmpty());
    }

    // refreshToken tests
    @Test
    @DisplayName("Should refresh token successfully")
    void refreshToken_Success() {
        Map<String, Object> extractedData = new HashMap<>();
        extractedData.put("data", "test@example.com");

        when(httpServletRequest.getHeader(HttpHeaders.AUTHORIZATION)).thenReturn("Bearer refresh-token");
        when(jwtService.extractUsername("refresh-token")).thenReturn(extractedData);
        when(userRepository.findUserByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(jwtService.isTokenValid("refresh-token", testUser)).thenReturn(true);
        when(jwtService.generateToken(testUser)).thenReturn("new-access-token");

        Response<AuthenticationResponse> response = userService.refreshToken(httpServletRequest);

        assertEquals(HttpStatus.OK.value(), response.getStatus());
        assertEquals("Token refreshed successfully", response.getMessage());
        assertNotNull(response.getData());
        assertEquals("new-access-token", response.getData().getAccessToken());
        assertEquals("refresh-token", response.getData().getRefreshToken());
    }

    @Test
    @DisplayName("Should return error when authorization header is missing")
    void refreshToken_MissingHeader() {
        when(httpServletRequest.getHeader(HttpHeaders.AUTHORIZATION)).thenReturn(null);

        Response<AuthenticationResponse> response = userService.refreshToken(httpServletRequest);

        assertEquals(HttpStatus.UNAUTHORIZED.value(), response.getStatus());
        assertEquals("Authorization header is missing or invalid", response.getMessage());
        assertNull(response.getData());
    }

    @Test
    @DisplayName("Should return error when token is invalid")
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
    @DisplayName("Should return error when user is not found")
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

    @Test
    @DisplayName("Should return error when refresh token is invalid for user")
    void refreshToken_InvalidTokenForUser() {
        Map<String, Object> extractedData = new HashMap<>();
        extractedData.put("data", "test@example.com");

        when(httpServletRequest.getHeader(HttpHeaders.AUTHORIZATION)).thenReturn("Bearer refresh-token");
        when(jwtService.extractUsername("refresh-token")).thenReturn(extractedData);
        when(userRepository.findUserByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(jwtService.isTokenValid("refresh-token", testUser)).thenReturn(false);

        Response<AuthenticationResponse> response = userService.refreshToken(httpServletRequest);

        assertEquals(HttpStatus.UNAUTHORIZED.value(), response.getStatus());
        assertEquals("Invalid or expired refresh token", response.getMessage());
        assertNull(response.getData());
    }

    // getUserAvatar tests
    @Test
    @DisplayName("Should get user avatar successfully")
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