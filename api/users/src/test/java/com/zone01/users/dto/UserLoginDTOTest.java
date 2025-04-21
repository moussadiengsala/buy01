package com.zone01.users.dto;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class UserLoginDTOTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void validateValidLogin() {
        UserLoginDTO dto = UserLoginDTO.builder()
                .email("test@example.com")
                .password("Password123!")
                .build();

        var violations = validator.validate(dto);
        assertTrue(violations.isEmpty());
    }

    @Test
    void validateInvalidEmail() {
        UserLoginDTO dto = UserLoginDTO.builder()
                .email("invalid-email")
                .password("Password123!")
                .build();

        var violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().contains("email")));
    }

    @Test
    void validateEmptyEmail() {
        UserLoginDTO dto = UserLoginDTO.builder()
                .email("")
                .password("Password123!")
                .build();

        var violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().contains("email")));
    }

    @Test
    void validateEmptyPassword() {
        UserLoginDTO dto = UserLoginDTO.builder()
                .email("test@example.com")
                .password("")
                .build();

        var violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().contains("password")));
    }

    @Test
    void validateNullEmail() {
        UserLoginDTO dto = UserLoginDTO.builder()
                .email(null)
                .password("Password123!")
                .build();

        var violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().contains("email")));
    }

    @Test
    void validateNullPassword() {
        UserLoginDTO dto = UserLoginDTO.builder()
                .email("test@example.com")
                .password(null)
                .build();

        var violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().contains("password")));
    }
} 