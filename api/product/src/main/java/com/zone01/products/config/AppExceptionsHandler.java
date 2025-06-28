package com.zone01.products.config;

import com.zone01.products.model.Response;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;


@RestControllerAdvice
public class AppExceptionsHandler {
    private static final Map<HttpStatus, Pattern> EXCEPTION_PATTERNS = createPatternMap();
    private static Map<HttpStatus, Pattern> createPatternMap() {
        Map<HttpStatus, Pattern> patterns = new ConcurrentHashMap<>();

        // 400 Bad Request - Client input validation errors
        patterns.put(HttpStatus.BAD_REQUEST,
                Pattern.compile(String.join("|",
                        ".*(?:Invalid|Illegal|Constraint|Validation|BadRequest|TypeMismatch|Bind).*Exception",
                        ".*(?:Missing(?:Parameter|ServletRequestParameter|RequestHeader)).*Exception",
                        ".*(?:Parse|Format|MethodArgumentNotValid|HttpMessageNotReadable).*Exception",
                        ".*(?:RequestBodyMissing|JsonMapping|JsonParse|FieldError).*Exception",
                        ".*(?:ConstraintViolation|ValidationFailure|InvalidInput|MalformedRequest).*Exception",
                        ".*(?:DeserializationException|SerializationException|ConversionException).*Exception"
                ), Pattern.CASE_INSENSITIVE)
        );

        // 401 Unauthorized - Authentication failures
        patterns.put(HttpStatus.UNAUTHORIZED,
                Pattern.compile(String.join("|",
                        ".*(?:Authentication|Credential|Jwt|Token|Unauthorized).*Exception",
                        ".*(?:InvalidCredentials|Login|Session|InvalidToken|ExpiredToken).*Exception",
                        ".*(?:AuthenticationFailure|UnauthenticatedException|LoginRequired).*Exception",
                        ".*(?:TokenExpiredException|InvalidSessionException|CredentialExpired).*Exception"
                ), Pattern.CASE_INSENSITIVE)
        );

        // 403 Forbidden - Authorization failures
        patterns.put(HttpStatus.FORBIDDEN,
                Pattern.compile(String.join("|",
                        ".*(?:AccessDenied|Authorization|Forbidden|Security|Permission).*Exception",
                        ".*(?:Locked|Disabled|Insufficient|AccessViolation|SecurityViolation).*Exception",
                        ".*(?:PrivilegeViolation|ForbiddenAccess|AccessRestriction|InsufficientPrivileges).*Exception",
                        ".*(?:ResourceAccessDenied|OperationNotPermitted|UnauthorizedOperation).*Exception"
                ), Pattern.CASE_INSENSITIVE)
        );

        // 404 Not Found - Resource not found errors
        patterns.put(HttpStatus.NOT_FOUND,
                Pattern.compile(String.join("|",
                        ".*(?:NotFound|NoResourceFound|NoSuchElement|MissingResource|Unknown).*Exception",
                        ".*(?:ResourceUnavailable|EntityNotFound|HttpClientErrorException).*Exception",
                        ".*(?:ResourceNotAvailable|NoHandlerFound|ItemNotFound|RecordNotFound).*Exception",
                        ".*(?:ObjectNotFound|DocumentNotFound|FileNotFound|PathNotFound).*Exception",
                        ".*(?:DataNotFound|KeyNotFound|ValueNotFound|EndpointNotFound).*Exception"
                ), Pattern.CASE_INSENSITIVE)
        );

        // 405 Method Not Allowed
        patterns.put(HttpStatus.METHOD_NOT_ALLOWED,
                Pattern.compile(String.join("|",
                        ".*(?:MethodNotSupported|InvalidMethod|HttpRequestMethod).*Exception",
                        ".*(?:MethodNotAllowed|UnsupportedHttpMethod|InvalidHttpMethod).*Exception"
                ), Pattern.CASE_INSENSITIVE)
        );

        // 406 Not Acceptable
        patterns.put(HttpStatus.NOT_ACCEPTABLE,
                Pattern.compile(String.join("|",
                        ".*(?:NotAcceptable|MediaType.*Accept|ContentNegotiation).*Exception",
                        ".*(?:AcceptHeaderMismatch|UnsupportedAcceptType).*Exception"
                ), Pattern.CASE_INSENSITIVE)
        );

        // 408 Request Timeout
        patterns.put(HttpStatus.REQUEST_TIMEOUT,
                Pattern.compile(String.join("|",
                        ".*(?:Timeout|TimedOut|ConnectionTimedOut|RequestTimeout).*Exception",
                        ".*(?:SocketTimeout|ReadTimeout|ConnectTimeout|ResponseTimeout).*Exception"
                ), Pattern.CASE_INSENSITIVE)
        );

        // 409 Conflict - Data integrity and concurrency issues
        patterns.put(HttpStatus.CONFLICT,
                Pattern.compile(String.join("|",
                        ".*(?:Conflict|Duplicate|DataIntegrity|OptimisticLocking|Pessimistic).*Exception",
                        ".*(?:Version|Concurrent|StaleState|ResourceConflict|StateConflict).*Exception",
                        ".*(?:DuplicateKey|UniqueConstraint|ConcurrentModification).*Exception"
                ), Pattern.CASE_INSENSITIVE)
        );

        // 413 Payload Too Large
        patterns.put(HttpStatus.PAYLOAD_TOO_LARGE,
                Pattern.compile(String.join("|",
                        ".*(?:SizeExceeded|TooLarge|MaxUploadSize|FileSizeLimitExceeded).*Exception",
                        ".*(?:PayloadTooLarge|RequestTooLarge|ContentLengthExceeded).*Exception"
                ), Pattern.CASE_INSENSITIVE)
        );

        // 415 Unsupported Media Type
        patterns.put(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                Pattern.compile(String.join("|",
                        ".*(?:UnsupportedMediaType|MediaTypeNotSupported|MimeType).*Exception",
                        ".*(?:ContentTypeNotSupported|InvalidContentType|UnknownMediaType).*Exception"
                ), Pattern.CASE_INSENSITIVE)
        );

        // 422 Unprocessable Entity - Semantic validation errors
        patterns.put(HttpStatus.UNPROCESSABLE_ENTITY,
                Pattern.compile(String.join("|",
                        ".*(?:Unprocessable|ValidationFailed|Invalid.*Content).*Exception",
                        ".*(?:DataIntegrityViolation|BusinessRuleViolation|SemanticError).*Exception",
                        ".*(?:ProcessingException|UnprocessableContent|InvalidBusinessLogic).*Exception"
                ), Pattern.CASE_INSENSITIVE)
        );

        // 429 Too Many Requests
        patterns.put(HttpStatus.TOO_MANY_REQUESTS,
                Pattern.compile(String.join("|",
                        ".*(?:TooMany|RateLimit|Throttling|RequestLimit|Excessive).*Exception",
                        ".*(?:QuotaExceeded|RateLimitExceeded|ThrottledException).*Exception"
                ), Pattern.CASE_INSENSITIVE)
        );

        // 500 Internal Server Error patterns
        patterns.put(HttpStatus.INTERNAL_SERVER_ERROR,
                Pattern.compile(String.join("|",
                        ".*(?:Internal|Server|System|Runtime|Unexpected|Fatal).*Exception",
                        ".*(?:DatabaseException|ConnectionException|ConfigurationException).*Exception",
                        ".*(?:ServiceUnavailable|ProcessingFailure|SystemFailure).*Exception"
                ), Pattern.CASE_INSENSITIVE)
        );

        // 502 Bad Gateway
        patterns.put(HttpStatus.BAD_GATEWAY,
                Pattern.compile(String.join("|",
                        ".*(?:BadGateway|Gateway|Proxy|Upstream|Backend).*Exception",
                        ".*(?:RemoteServiceException|ExternalServiceException).*Exception"
                ), Pattern.CASE_INSENSITIVE)
        );

        // 503 Service Unavailable
        patterns.put(HttpStatus.SERVICE_UNAVAILABLE,
                Pattern.compile(String.join("|",
                        ".*(?:ServiceUnavailable|Unavailable|CircuitBreaker|LoadBalancer).*Exception",
                        ".*(?:OverloadException|CapacityExceeded|MaintenanceMode).*Exception"
                ), Pattern.CASE_INSENSITIVE)
        );

        // 504 Gateway Timeout
        patterns.put(HttpStatus.GATEWAY_TIMEOUT,
                Pattern.compile(String.join("|",
                        ".*(?:GatewayTimeout|RemoteTimeout|BackendTimeout).*Exception",
                        ".*(?:UpstreamTimeout|ProxyTimeout|ExternalTimeout).*Exception"
                ), Pattern.CASE_INSENSITIVE)
        );

        return patterns;
    }

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

    protected HttpStatus resolveStatus(Exception ex) {
        String exceptionName = ex.getClass().getSimpleName();

        ResponseStatus responseStatus = AnnotationUtils.findAnnotation(ex.getClass(), ResponseStatus.class);
        if (responseStatus != null) {
            return responseStatus.value();
        }

        for (Map.Entry<HttpStatus, Pattern> e : EXCEPTION_PATTERNS.entrySet()) {
            if (e.getValue().matcher(exceptionName).matches()) {
                return e.getKey();
            }
        }

        // Default to internal server error
        return HttpStatus.BAD_REQUEST;
    }

}