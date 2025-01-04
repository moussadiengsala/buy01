package com.zone01.products.config;

import com.zone01.products.model.ExceptionPattern;
import com.zone01.products.model.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;


@RestControllerAdvice
public class AppExceptionsHandler {
    private static final Logger logger = LoggerFactory.getLogger(AppExceptionsHandler.class);

    private static final List<ExceptionPattern> EXCEPTION_PATTERNS = new ArrayList<>() {{
        // 400 BAD REQUEST
        add(new ExceptionPattern(
                Pattern.compile(".*(Invalid|Illegal|Constraint|Validation|BadRequest|TypeMismatch|Bind|Missing(Parameter|ServletRequestParameter|RequestHeader)|Parse|Format|MethodArgumentNotValid|HttpMessageNotReadable|RequestBodyMissing|JsonMapping|JsonParse|FieldError).*Exception",
                        Pattern.CASE_INSENSITIVE),
                HttpStatus.BAD_REQUEST
        ));

        // 401 UNAUTHORIZED
        add(new ExceptionPattern(
                Pattern.compile(".*(Authentication|Credential|Jwt|Token|Unauthorized|InvalidCredentials|Login|Session|InvalidToken|ExpiredToken|AccessDenied|AuthenticationFailure|AuthorizationFailure).*Exception",
                        Pattern.CASE_INSENSITIVE),
                HttpStatus.UNAUTHORIZED
        ));

        // 403 FORBIDDEN
        add(new ExceptionPattern(
                Pattern.compile(".*(AccessDenied|Authorization|Forbidden|Security|Locked|Disabled|Permission|Insufficient|Unauthorized|InvalidCredentials|TokenExpired|SessionExpired|AccessViolation|InvalidToken|InvalidAccess|SecurityViolation|PrivilegeViolation|ForbiddenAccess|AccessRestriction).*Exception",
                        Pattern.CASE_INSENSITIVE),
                HttpStatus.FORBIDDEN
        ));

        // 404 NOT FOUND
        add(new ExceptionPattern(
                Pattern.compile(".*(NotFound|NoResourceFound|NoSuchElement|MissingResource|Unknown|ResourceUnavailable|EntityNotFound|HttpClientErrorException|ResourceNotAvailable|NoHandlerFound|ItemNotFound|RecordNotFound|ObjectNotFound|DocumentNotFound|FileNotFound|PathNotFound|DataNotFound|KeyNotFound|ValueNotFound).*Exception",
                        Pattern.CASE_INSENSITIVE),
                HttpStatus.NOT_FOUND));

        // 405 METHOD NOT ALLOWED
        add(new ExceptionPattern(
                Pattern.compile(".*(MethodNotSupported|InvalidMethod|HttpRequestMethod).*Exception",
                        Pattern.CASE_INSENSITIVE),
                HttpStatus.METHOD_NOT_ALLOWED));

        // 406 NOT ACCEPTABLE
        add(new ExceptionPattern(
                Pattern.compile(".*(NotAcceptable|MediaType.*Accept|ContentNegotiation).*Exception",
                        Pattern.CASE_INSENSITIVE),
                HttpStatus.NOT_ACCEPTABLE
        ));

        // 408 REQUEST TIMEOUT
        add(new ExceptionPattern(
                Pattern.compile(".*(Timeout|TimedOut|ConnectionTimedOut).*Exception",
                        Pattern.CASE_INSENSITIVE),
                HttpStatus.REQUEST_TIMEOUT
        ));

        // 409 CONFLICT
        add(new ExceptionPattern(
                Pattern.compile(".*(Conflict|Duplicate|DataIntegrity|OptimisticLocking|Pessimistic|Version|Concurrent|StaleState).*Exception",
                        Pattern.CASE_INSENSITIVE),
                HttpStatus.CONFLICT
        ));

        // 413 PAYLOAD TOO LARGE
        add(new ExceptionPattern(
                Pattern.compile(".*(SizeExceeded|TooLarge|MaxUploadSize|FileSizeLimitExceeded).*Exception",
                        Pattern.CASE_INSENSITIVE),
                HttpStatus.PAYLOAD_TOO_LARGE
        ));

        // 415 UNSUPPORTED MEDIA TYPE
        add(new ExceptionPattern(
                Pattern.compile(".*(UnsupportedMediaType|MediaTypeNotSupported|MimeType).*Exception",
                        Pattern.CASE_INSENSITIVE),
                HttpStatus.UNSUPPORTED_MEDIA_TYPE
        ));

        // 422 UNPROCESSABLE ENTITY
        add(new ExceptionPattern(
                Pattern.compile(".*(Unprocessable|ValidationFailed|Invalid.*Content|DataIntegrityViolation).*Exception",
                        Pattern.CASE_INSENSITIVE),
                HttpStatus.UNPROCESSABLE_ENTITY
        ));

        // 429 TOO MANY REQUESTS
        add(new ExceptionPattern(
                Pattern.compile(".*(TooMany|RateLimit|Throttling|RequestLimit|Excessive).*Exception",
                        Pattern.CASE_INSENSITIVE),
                HttpStatus.TOO_MANY_REQUESTS
        ));
//        // Database related - 500
//        add(new ExceptionPattern(
//                Pattern.compile(".*(SQL|Database|Data|JDBC|Hibernate|JPA|Repository|Persistence|Query).*Exception",
//                        Pattern.CASE_INSENSITIVE),
//                HttpStatus.INTERNAL_SERVER_ERROR,
//                "Database Error"
//        ));
//
//        // IO related - 500
//        add(new ExceptionPattern(
//                Pattern.compile(".*(IO|File|Stream|Network|Socket|FileNotFound|IOException|ResourceAccess).*Exception",
//                        Pattern.CASE_INSENSITIVE),
//                HttpStatus.INTERNAL_SERVER_ERROR,
//                "I/O Error"
//        ));
//
//        // General server errors - 500
//        add(new ExceptionPattern(
//                Pattern.compile(".*(NullPointer|IndexOutOfBounds|Runtime|System|Internal|Error|Unexpected|Unhandled).*Exception",
//                        Pattern.CASE_INSENSITIVE),
//                HttpStatus.INTERNAL_SERVER_ERROR,
//                "Internal Server Error"
//        ));

        // Fallback for unhandled exceptions - 500
//        add(new ExceptionPattern(
//                Pattern.compile(".*Exception", Pattern.CASE_INSENSITIVE),
//                HttpStatus.BAD_REQUEST
//        ));
    }};


    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Response<Map<String, String>>> handleValidationException(MethodArgumentNotValidException ex){
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        Response<Map<String, String>> response = Response.<Map<String, String>>builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .data(errors)
                .message("Validation Failed")
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ResponseStatus
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Response<Map<String, String>>> handleGlobalException(Exception ex) {
        HttpStatus status = resolveStatus(ex);

        String exceptionMessage = ex.getMessage() != null ? ex.getMessage() : "Unknown error occurred";

        Map<String, String> errorDetails = new HashMap<>();
        errorDetails.put("error_type", ex.getClass().getSimpleName());
        errorDetails.put("error_message", exceptionMessage);

        Response<Map<String, String>> response = Response.<Map<String, String>>builder()
                .status(status.value())
                .data(errorDetails)
                .message(ex.getMessage())
                .build();

        return ResponseEntity.status(response.getStatus()).body(response);
    }

//    private HttpStatus getStatus(Exception ex) {
//        ResponseStatus responseStatus = AnnotationUtils.findAnnotation(ex.getClass(), ResponseStatus.class);
//        System.out.println(ex);
//        if (responseStatus != null) {
//            return responseStatus.value();
//        }
//        return EXCEPTION_STATUS_MAP.getOrDefault(ex.getClass(), HttpStatus.BAD_REQUEST);
//    }

    protected HttpStatus resolveStatus(Exception ex) {
        String exceptionName = ex.getClass().getSimpleName();

        // First check for @ResponseStatus annotation
        ResponseStatus responseStatus = AnnotationUtils.findAnnotation(ex.getClass(), ResponseStatus.class);
        if (responseStatus != null) {
            return responseStatus.value();
        }

        for (ExceptionPattern pattern : EXCEPTION_PATTERNS) {
            if (pattern.pattern().matcher(exceptionName).matches()) {
                return pattern.status();
            }
        }

        // Default to internal server error
        return HttpStatus.BAD_REQUEST;
    }

}