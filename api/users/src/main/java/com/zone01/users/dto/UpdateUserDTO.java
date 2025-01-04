package com.zone01.users.dto;

import com.zone01.users.model.Response;
import com.zone01.users.model.Role;
import com.zone01.users.service.FileServices;
import com.zone01.users.user.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.multipart.MultipartFile;

import java.util.function.Predicate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserDTO {
    private String name;
    private String prev_password;
    private String new_password;
    private Role role;
    private MultipartFile avatar;

    public Response<Object> applyUpdates(PasswordEncoder passwordEncoder, User user, FileServices fileServices) {

        if (this.name != null && !this.name.isEmpty()) {
            Response<Object> validationResponse = validateField("name", this.name,
                    value -> value.length() >= 2 &&
                            value.length() <= 20 &&
                            value.matches("^[A-Za-zÀ-ÿ\\s'-]+$"),
                    "Name must be between 2 and 20 characters and can only contain letters, spaces, hyphens, and apostrophes");
            if (validationResponse != null) {return validationResponse;}
            user.setName(this.name);
        }

        // Password update with comprehensive validation
        if (this.new_password != null && !this.new_password.isEmpty() && this.prev_password != null && !this.prev_password.isEmpty()) {
            Response<Object> validationResponse = validatePassword(passwordEncoder, user, this.new_password, this.prev_password);
            if (validationResponse != null) {return validationResponse;}
            user.setPassword(passwordEncoder.encode(this.new_password));
        }

        // Role update with validation
        if (this.role != null) {
            Response<Object> validationResponse = validateField("role", this.role,
                    value -> value == Role.CLIENT || value == Role.SELLER,
                    "Invalid role. Must be CLIENT or SELLER");
            if (validationResponse != null) {return validationResponse;}
            user.setRole(this.role);
        }

        // Avatar update with validation
        if (this.avatar != null && !this.avatar.isEmpty()) {
            Response<Object> validationResponse = this.validateAvatar(fileServices, user);
            if (validationResponse != null) {return validationResponse;}
        }
        return null;
    }

    private <T> Response<Object> validateField(String fieldName, T value, Predicate<T> validator, String errorMessage) {
        if (value == null || !validator.test(value)) {
            return Response.<Object>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(fieldName + ": " + errorMessage)
                    .data(null)
                    .build();
        }
        return null;
    }

    private Response<Object> validatePassword(PasswordEncoder passwordEncoder, User user, String newPassword, String prevPassword) {
        if (!passwordEncoder.matches(prevPassword, user.getPassword())) {
            return Response.<Object>builder()
                    .data(null)
                    .message("Previous password is incorrect")
                    .status(HttpStatus.BAD_REQUEST.value())
                    .build();
        }

        return validateField("new_password", newPassword,
                password -> password.length() >= 8 &&
                        password.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"),
                "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character");

    }

    private Response<Object> validateAvatar(FileServices fileServices, User user) {
        if (user.getRole() != Role.SELLER) {
            return Response.<Object>builder()
                    .data(null)
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("You're not allowed to upload or update avatar.")
                    .build();
        }

        try {
            Response<Object> fileValidationResponse = fileServices.validateFile(this.avatar);
            if (fileValidationResponse != null) {
                return fileValidationResponse;
            }

            String avatarUrl = fileServices.saveFile(this.avatar);
            Response<Object> deletedAvatarResponse = fileServices.deleteOldAvatar(user.getAvatar());
            if (deletedAvatarResponse != null) {return deletedAvatarResponse;}
            user.setAvatar(avatarUrl);
            return null;
        } catch (Exception e) {
            return Response.<Object>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .data(null)
                    .message(e.getMessage())
                    .build();
        }
    }
}