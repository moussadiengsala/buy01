package com.zone01.users.utils;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.HttpStatus;
import java.util.regex.Pattern;

//@Data
//@AllArgsConstructor
public record ExceptionPattern(Pattern pattern, HttpStatus status) {
}
