package com.clickcart.exception;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.clickcart.controller.AuthController;

/**
 * Auth-specific error mapping, scoped to {@link AuthController} so the shared GlobalExceptionHandler
 * is unchanged. Malformed JSON or an unknown enum value (e.g. role "ADMIN") becomes a 400 instead of a 500.
 */
@RestControllerAdvice(assignableTypes = AuthController.class)
@Order(Ordered.HIGHEST_PRECEDENCE)
public class AuthExceptionHandler {

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadable(HttpMessageNotReadableException ex) {
        ErrorResponse response = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                "The request body is missing or contains an invalid value");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}
