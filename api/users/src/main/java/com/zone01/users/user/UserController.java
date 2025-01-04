package com.zone01.users.user;

import com.zone01.users.dto.UpdateUserDTO;
import com.zone01.users.dto.UserDTO;
import com.zone01.users.dto.UserLoginDTO;
import com.zone01.users.dto.UserRegistrationDTO;
import com.zone01.users.model.AuthenticationResponse;
import com.zone01.users.model.Response;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<Response<UserDTO>> getUserById(@PathVariable String id) {
        return userService.getUserById(id)
                .map(user -> {
                    Response<UserDTO> response = Response.<UserDTO>builder()
                            .status(HttpStatus.OK.value())
                            .data(user)
                            .message("success")
                            .build();
                    return ResponseEntity.status(HttpStatus.OK).body(response);
                })
                .orElseGet(() -> {
                    Response<UserDTO> response = Response.<UserDTO>builder()
                            .status(HttpStatus.NOT_FOUND.value())
                            .data(null)
                            .message("User not found")
                            .build();
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                });
    }

    @GetMapping("/")
    public ResponseEntity<Response<List<UserDTO>>> getAllUsers() {
        Response<List<UserDTO>> users = userService.getAllUsers();
        return ResponseEntity.status(users.getStatus()).body(users);
    }

    @GetMapping("/avatar/{filename}")
    public ResponseEntity<Object> getUserAvatar(@PathVariable String filename) {
        Response<Object> response = userService.getUserAvatar(filename);
        if (response.getStatus() != HttpStatus.OK.value()) {
            return ResponseEntity.status(response.getStatus()).body(response);
        }

        Resource resource = (Resource) response.getData();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_JPEG);
        headers.setContentDispositionFormData("inline", resource.getFilename());

        return ResponseEntity.status(response.getStatus()).headers(headers).body(resource);
    }

    @PostMapping(value = "/auth/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Response<Object>> createUser(
            @Valid @ModelAttribute UserRegistrationDTO user
    ) {
        Response<Object> response = userService.createUser(user);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/auth/login")
    public ResponseEntity<Response<AuthenticationResponse>> authenticate(@Valid @RequestBody UserLoginDTO user) {
        Response<AuthenticationResponse> response = userService.authenticate(user);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/auth/refresh-token")
    public ResponseEntity<Response<AuthenticationResponse>> refreshToken(HttpServletRequest request) {
        Response<AuthenticationResponse> response = userService.refreshToken(request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("#id == authentication.principal.id")
    @PutMapping("/{id}")
    public ResponseEntity<Response<Object>> updateUser(
            @PathVariable String id,
            @Valid @ModelAttribute UpdateUserDTO updateUserDTO
            ) {
        Response<Object> updatedUser = userService.updateUser(id, updateUserDTO);
        return ResponseEntity.status(updatedUser.getStatus()).body(updatedUser);
    }

    @PreAuthorize("#id == authentication.principal.id")
    @DeleteMapping("/{id}")
    public ResponseEntity<Response<UserDTO>> deleteUser(@PathVariable String id) {
        Response<UserDTO> deletedUser = userService.deleteUser(id);
        return ResponseEntity.status(deletedUser.getStatus()).body(deletedUser);
    }

}
