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
import jakarta.ws.rs.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final FileServices fileServices;
    private final AuthenticationManager authenticationManager;

    @Autowired // can be omitted if the class has only one constructor
    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager,
            FileServices fileServices
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.fileServices = fileServices;
    }

    public Optional<UserDTO> getUserById(String id) {
        return userRepository.findById(id)
                .map(user -> new UserDTO(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getRole(),
                    user.getAvatar()
                ));
    }

    public Response<Object> createUser(UserRegistrationDTO user) {
        Optional<User> userOptional = userRepository.findUserByEmail(user.getEmail());
        if (userOptional.isPresent()) {
            return Response.<Object>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .data(null)
                    .message("Email already in use.")
                    .build();
        }

        String avatarUrl = null;
        if (!(user.getAvatar() == null || user.getAvatar().isEmpty() || user.getRole() == Role.CLIENT)) {
            try {
                // Validate file
                Response<Object> fileValidationResponse = fileServices.validateFile(user.getAvatar());
                if (fileValidationResponse != null) {
                    return fileValidationResponse;
                }

                // Save file securely
                avatarUrl = fileServices.saveFile(user.getAvatar());
            } catch (Exception e) {
                return Response.<Object>builder()
                        .status(HttpStatus.BAD_REQUEST.value())
                        .data(null)
                        .message(e.getMessage())
                        .build();
            }
        }

        User new_user = User.builder()
                .name(user.getName())
                .email(user.getEmail())
                .password(passwordEncoder.encode(user.getPassword()))
                .role(user.getRole())
                .avatar(avatarUrl)
                .build();

        userRepository.save(new_user);
        var jwtToken = jwtService.generateToken(new_user);
        var refreshToken = jwtService.generateRefreshToken(new_user);
        return Response.<Object>builder()
                .status(HttpStatus.CREATED.value())
                .message("user has been created successfully.")
                .data(AuthenticationResponse.builder()
                        .accessToken(jwtToken)
                        .refreshToken(refreshToken)
                        .build())
                .build();
    }

    public Response<Object> getUserAvatar(String filename) {
        return fileServices.getAvatar(filename);
    }

    public Response<AuthenticationResponse> authenticate(UserLoginDTO loginRequest) {
        Optional<User> userOptional = userRepository.findUserByEmail(loginRequest.getEmail());
        if (userOptional.isEmpty()) {
            return Response.<AuthenticationResponse>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .data(null)
                    .message("Email does not exist.")
                    .build();
        }

         authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        User user = userOptional.get();
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);

        return Response.<AuthenticationResponse>builder()
                .status(HttpStatus.OK.value())
                .message("user has been authenticated successfully.")
                .data(AuthenticationResponse.builder()
                        .accessToken(jwtToken)
                        .refreshToken(refreshToken)
                        .build())
                .build();
    }

    public Response<Object> updateUser(String userId, UpdateUserDTO updateUserDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Response<Object> updateResponse = updateUserDTO.applyUpdates(passwordEncoder, user, fileServices);
        if (updateResponse != null) { return updateResponse;}

        User updatedUser = userRepository.save(user);
        UserDTO updatedUserDTO = new UserDTO(
                updatedUser.getId(),
                updatedUser.getName(),
                updatedUser.getEmail(),
                updatedUser.getRole(),
                updatedUser.getAvatar()
        );

        // Build and return response
        return Response.<Object>builder()
                .status(HttpStatus.OK.value())
                .data(updatedUserDTO)
                .message("User updated successfully")
                .build();
    }

    public Response<UserDTO> deleteUser(String id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        userRepository.deleteById(id);
        UserDTO deletedUserDTO = new UserDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getAvatar()
        );

        // Return success response
        return Response.<UserDTO>builder()
                .status(HttpStatus.OK.value())
                .data(deletedUserDTO)
                .message("User deleted successfully")
                .build();
    }

    public Response<List<UserDTO>> getAllUsers() {
        List<UserDTO> userDTOList = userRepository.findAll().stream()
                .map(user -> new UserDTO(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole(),
                        user.getAvatar()
                ))
                .collect(Collectors.toList());

        return Response.<List<UserDTO>>builder()
                .data(userDTOList)
                .status(200)
                .message("success")
                .build();
    }

    public Response<AuthenticationResponse> refreshToken(HttpServletRequest request) {
        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        final String refreshToken;
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Response.<AuthenticationResponse>builder()
                    .status(HttpStatus.UNAUTHORIZED.value())
                    .data(null)
                    .message("Authorization header is missing or invalid")
                    .build();
        }

        refreshToken = authHeader.substring(7);
        Map<String, Object> extractedUserEmail = jwtService.extractUsername(refreshToken);
        if (extractedUserEmail.get("error") != null) {
            return Response.<AuthenticationResponse>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .data(null)
                    .message((String) extractedUserEmail.get("error"))
                    .build();
        }

        final String userEmail = (String) extractedUserEmail.get("data");
//        if (userEmail == null) {
//            return Response.<AuthenticationResponse>builder()
//                    .status(HttpStatus.UNAUTHORIZED.value())
//                    .data(null)
//                    .message("Invalid token: user information is missing")
//                    .build();
//        }

        // Find the user in the repository
        Optional<User> userOptional = userRepository.findUserByEmail(userEmail);
        if (userOptional.isEmpty()) {
            return Response.<AuthenticationResponse>builder()
                    .status(HttpStatus.NOT_FOUND.value())
                    .data(null)
                    .message("User not found")
                    .build();
        }

        User user = userOptional.get();

        // Validate the refresh token for the user
        if (!jwtService.isTokenValid(refreshToken, user)) {
            return Response.<AuthenticationResponse>builder()
                    .status(HttpStatus.UNAUTHORIZED.value())
                    .data(null)
                    .message("Invalid or expired refresh token")
                    .build();
        }

        String accessToken = jwtService.generateToken(user);
        AuthenticationResponse authResponse = AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();

        return Response.<AuthenticationResponse>builder()
                .status(HttpStatus.OK.value())
                .data(authResponse)
                .message("Token refreshed successfully")
                .build();
    }
}
