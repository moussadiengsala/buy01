package com.zone01.products.model;

import org.springframework.http.HttpStatus;

import java.util.regex.Pattern;

//@Data
//@AllArgsConstructor
public record ExceptionPattern(Pattern pattern, HttpStatus status) {
}
