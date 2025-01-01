package com.zone01.users.utils;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zone01.users.user.User;
import jakarta.validation.ValidationException;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Predicate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUser {
    private String name;
    private String prev_password;
    private String new_password;
    private Role role;
    private String avatar;

    /**
     * Validates and maps update fields from a generic map of updates.
     *
     * @param updates Map of fields to update
     * @return UpdateUserDTO with validated fields
     */
    public static UpdateUser fromUpdates(Map<String, Object> updates) {
        if (updates == null || updates.isEmpty()) {
            return new UpdateUser();
        }

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

        return objectMapper.convertValue(updates, UpdateUser.class);
    }

    /**
     * Applies validated updates to a user entity.
     *
     * @param user User entity to update
     * @param updates Map of fields to update
     * @return Map of applied updates
     */
    public Map<String, Object> applyUpdatesTo(PasswordEncoder passwordEncoder, User user, Map<String, Object> updates) {
        Map<String, Object> appliedUpdates = new HashMap<>();

        // Name update with validation
        if (updates.containsKey("name")) {
            String name = (String) updates.get("name");
            validateField("name", name,
                    value -> value.length() >= 2 &&
                            value.length() <= 20 &&
                            value.matches("^[A-Za-zÀ-ÿ\\s'-]+$"),
                    "Name must be between 2 and 20 characters and can only contain letters, spaces, hyphens, and apostrophes");

            user.setName(name);
            appliedUpdates.put("name", name);
        }

        // Password update with comprehensive validation
        if (updates.containsKey("new_password") && updates.containsKey("prev_password")) {
            String newPassword = (String) updates.get("new_password");
            String prevPassword = (String) updates.get("prev_password");

            validatePassword(passwordEncoder, user, newPassword, prevPassword);

            user.setPassword(passwordEncoder.encode(newPassword));
            appliedUpdates.put("password", "updated");
        }

        // Role update with validation
        if (updates.containsKey("role")) {
            Role role = Role.valueOf((String) updates.get("role"));
            validateField("role", role,
                    value -> value == Role.CLIENT || value == Role.SELLER,
                    "Invalid role. Must be CLIENT or SELLER");

            user.setRole(role);
            appliedUpdates.put("role", role);
        }

        // Avatar update with validation
        if (updates.containsKey("avatar")) {
            String avatar = (String) updates.get("avatar");
            validateField("avatar", avatar,
                    value -> value != null && !value.trim().isEmpty(),
                    "Avatar cannot be empty");

            user.setAvatar(avatar);
            appliedUpdates.put("avatar", avatar);
        }

        return appliedUpdates;
    }

    /**
     * Validates if the update request is empty.
     *
     * @return true if no updates are present, false otherwise
     */
    @JsonIgnore
    public boolean isEmpty() {
        return (name == null || name.isEmpty()) &&
                (prev_password == null || prev_password.isEmpty()) &&
                (new_password == null || new_password.isEmpty()) &&
                role == null &&
                (avatar == null || avatar.isEmpty());
    }

    private <T> void validateField(String fieldName, T value, Predicate<T> validator, String errorMessage) {
        if (value == null || !validator.test(value)) {
            throw new ValidationException(fieldName + ": " + errorMessage);
        }
    }

    private void validatePassword(PasswordEncoder passwordEncoder, User user, String newPassword, String prevPassword) {
        // Validate new password complexity
        validateField("new_password", newPassword,
                password -> password.length() >= 8 &&
                        password.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"),
                "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character");

        // Validate previous password match
        if (!passwordEncoder.matches(prevPassword, user.getPassword())) {
            throw new ValidationException("Previous password is incorrect");
        }
    }
}