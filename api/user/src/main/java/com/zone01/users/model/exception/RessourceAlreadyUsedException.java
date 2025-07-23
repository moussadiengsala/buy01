package com.zone01.users.model.exception;

public class RessourceAlreadyUsedException extends RuntimeException {
    public RessourceAlreadyUsedException(String message) {
        super(message);
    }
}
