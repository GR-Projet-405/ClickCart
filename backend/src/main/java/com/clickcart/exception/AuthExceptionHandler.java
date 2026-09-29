package com.clickcart.exception;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;

import com.clickcart.controller.AuthController;

/**
 * Auth-specific error mapping, scoped to {@link AuthController} so the shared GlobalExceptionHandler
 * is unchanged. Response bodies keep the shared ErrorResponse shape.
 */
@RestControllerAdvice(assignableTypes = AuthController.class)
@Order(Ordered.HIGHEST_PRECEDENCE)
public class AuthExceptionHandler {

    @ExceptionHandler(AuthException.class)
    public ResponseEntity<AuthErrorResponse> handleAuth(AuthException ex) {
        return ResponseEntity.status(ex.getStatus()).body(AuthErrorResponse.from(ex));
    }

    /** Malformed JSON or an unknown enum value (e.g. role "ADMIN") becomes a 400 instead of a 500. */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadable(HttpMessageNotReadableException ex) {
        return badRequest("The request body is missing or contains an invalid value", null);
    }

    /** Validation of @RequestParam values such as the email-availability query. */
    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ErrorResponse> handleParameterValidation(HandlerMethodValidationException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        ex.getParameterValidationResults().forEach(result -> {
            String name = result.getMethodParameter().getParameterName();
            result.getResolvableErrors().stream().findFirst()
                    .ifPresent(error -> fieldErrors.put(name, error.getDefaultMessage()));
        });
        return badRequest("Input validation failed for one or more fields", fieldErrors);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParameter(MissingServletRequestParameterException ex) {
        return badRequest("Input validation failed for one or more fields",
                Map.of(ex.getParameterName(), "This value is required"));
    }

    private static ResponseEntity<ErrorResponse> badRequest(String message, Map<String, String> fieldErrors) {
        String error = fieldErrors == null ? "Bad Request" : "Validation Error";
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST.value(), error, message, fieldErrors));
    }
}
