package com.zone01.media.utils;

import org.springframework.http.HttpStatus;

import java.util.regex.Pattern;

//@Data
//@AllArgsConstructor
public record ExceptionPattern(Pattern pattern, HttpStatus status) {
}
