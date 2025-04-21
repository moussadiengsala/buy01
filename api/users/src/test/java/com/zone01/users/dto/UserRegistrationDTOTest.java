package com.zone01.users.dto;

import com.zone01.users.model.Role;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class UserRegistrationDTOTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void validateValidUserRegistration() {
        UserRegistrationDTO dto = UserRegistrationDTO.builder()
                .name("John Doe")
                .email("test@example.com")
                .password("Password123!")
                .role(Role.CLIENT)
                .build();

        var violations = validator.validate(dto);
        assertTrue(violations.isEmpty());
    }

    @Test
    void validateInvalidEmail() {
        UserRegistrationDTO dto = UserRegistrationDTO.builder()
                .name("John Doe")
                .email("invalid-email")
                .password("Password123!")
                .role(Role.CLIENT)
                .build();

        var violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().contains("email")));
    }

    @Test
    void validateWeakPassword() {
        UserRegistrationDTO dto = UserRegistrationDTO.builder()
                .name("John Doe")
                .email("test@example.com")
                .password("weak")
                .role(Role.CLIENT)
                .build();

        var violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().contains("password")));
    }

    @Test
    void validateEmptyName() {
        UserRegistrationDTO dto = UserRegistrationDTO.builder()
                .name("")
                .email("test@example.com")
                .password("Password123!")
                .role(Role.CLIENT)
                .build();

        var violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().contains("name")));
    }

    @Test
    void validateNullRole() {
        UserRegistrationDTO dto = UserRegistrationDTO.builder()
                .name("John Doe")
                .email("test@example.com")
                .password("Password123!")
                .role(null)
                .build();

        var violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().contains("role")));
    }
} 