package com.clickcart.exception;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class GlobalExceptionHandler {

        private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

        // ==========================================
        // Custom API & Payment Exceptions
        // ==========================================

        @ExceptionHandler(ApiException.class)
        public ResponseEntity<ErrorResponse> handleApi(ApiException exception) {
                HttpStatus status = exception.getStatus();
                return ResponseEntity.status(status)
                                .body(new ErrorResponse(status.value(), status.getReasonPhrase(),
                                                exception.getMessage()));
        }

        @ExceptionHandler(PaymentNotFoundException.class)
        public ResponseEntity<Map<String, Object>> handlePaymentNotFound(PaymentNotFoundException ex) {
                Map<String, Object> body = new HashMap<>();
                body.put("timestamp", Instant.now().toString());
                body.put("status", HttpStatus.NOT_FOUND.value());
                body.put("error", "Payment Not Found");
                body.put("message", ex.getMessage());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
        }

        @ExceptionHandler(PaymentException.class)
        public ResponseEntity<Map<String, Object>> handlePaymentException(PaymentException ex) {
                Map<String, Object> body = new HashMap<>();
                body.put("timestamp", Instant.now().toString());
                body.put("status", HttpStatus.BAD_REQUEST.value());
                body.put("error", "Payment Request Error");
                body.put("message", ex.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
        }

        // ==========================================
        // Core API Exceptions
        // ==========================================

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ApiErrorResponse> handleResourceNotFound(ResourceNotFoundException ex,
                        WebRequest request) {
                ApiErrorResponse error = new ApiErrorResponse(
                                LocalDateTime.now(), HttpStatus.NOT_FOUND.value(), "Not Found",
                                ex.getMessage(), request.getDescription(false).replace("uri=", ""));
                return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        }

        @ExceptionHandler(InvalidPricingException.class)
        public ResponseEntity<ApiErrorResponse> handleInvalidPricing(InvalidPricingException ex, WebRequest request) {
                ApiErrorResponse error = new ApiErrorResponse(
                                LocalDateTime.now(), HttpStatus.BAD_REQUEST.value(), "Bad Request",
                                ex.getMessage(), request.getDescription(false).replace("uri=", ""));
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex,
                        WebRequest request) {
                String errors = ex.getBindingResult().getFieldErrors().stream()
                                .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
                                .collect(Collectors.joining(", "));

                ApiErrorResponse error = new ApiErrorResponse(
                                LocalDateTime.now(), HttpStatus.BAD_REQUEST.value(), "Validation Failed",
                                errors, request.getDescription(false).replace("uri=", ""));
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }

        // ==========================================
        // Other Exceptions (Auth, Conflict, etc.)
        // ==========================================

        @ExceptionHandler(ReviewNotFoundException.class)
        public ResponseEntity<ErrorResponse> handleReviewNotFound(ReviewNotFoundException ex) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(new ErrorResponse(HttpStatus.NOT_FOUND.value(), "Not Found", ex.getMessage()));
        }

        @ExceptionHandler(UnauthorizedException.class)
        public ResponseEntity<ErrorResponse> handleUnauthorized(UnauthorizedException ex) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(new ErrorResponse(HttpStatus.UNAUTHORIZED.value(), "Unauthorized",
                                                ex.getMessage()));
        }

        @ExceptionHandler({
                        ForbiddenException.class,
                        AccessDeniedException.class,
                        AccessForbiddenException.class,
                        org.springframework.security.access.AccessDeniedException.class
        })
        public ResponseEntity<ErrorResponse> handleForbidden(Exception ex) {
                String message = ex.getMessage() != null ? ex.getMessage()
                                : "You do not have permission to access this resource";
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(new ErrorResponse(HttpStatus.FORBIDDEN.value(), "Forbidden", message));
        }

        @ExceptionHandler({ AvailabilityConflictException.class, DuplicateResourceException.class })
        public ResponseEntity<ErrorResponse> handleConflictExceptions(Exception ex) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(new ErrorResponse(HttpStatus.CONFLICT.value(), "Conflict", ex.getMessage()));
        }

        @ExceptionHandler(InvalidLocationException.class)
        public ResponseEntity<ErrorResponse> handleInvalidLocation(InvalidLocationException ex) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(new ErrorResponse(HttpStatus.BAD_REQUEST.value(), "Invalid Location",
                                                ex.getMessage()));
        }

        // ==========================================
        // Invalid Request & Validation Handlers (400)
        // ==========================================

        @ExceptionHandler(HttpMessageNotReadableException.class)
        public ResponseEntity<ErrorResponse> handleUnreadableRequest(HttpMessageNotReadableException ex) {
                return badRequest("Request body is missing or malformed");
        }

        @ExceptionHandler(MethodArgumentTypeMismatchException.class)
        public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
                if ("role".equalsIgnoreCase(ex.getName())) {
                        return badRequest("role must be CUSTOMER or PROVIDER");
                }
                return badRequest("Invalid value for parameter '" + ex.getName() + "'");
        }

        @ExceptionHandler({
                        BadRequestException.class,
                        MaxUploadSizeExceededException.class,
                        MissingServletRequestPartException.class,
                        IllegalArgumentException.class
        })
        public ResponseEntity<ErrorResponse> handleBadRequestExceptions(Exception exception) {
                String message;
                if (exception instanceof MaxUploadSizeExceededException) {
                        message = "Uploaded file exceeds the permitted size.";
                } else if (exception instanceof MissingServletRequestPartException) {
                        message = "A required file or request part is missing.";
                } else {
                        message = exception.getMessage() != null ? exception.getMessage() : "Invalid request.";
                }
                return badRequest(message);
        }

        @ExceptionHandler(MissingServletRequestParameterException.class)
        public ResponseEntity<ErrorResponse> handleMissingParam(MissingServletRequestParameterException ex) {
                return badRequest("Required request parameter '" + ex.getParameterName() + "' is not present");
        }

        @ExceptionHandler(HandlerMethodValidationException.class)
        public ResponseEntity<ErrorResponse> handleMethodValidation(HandlerMethodValidationException ex) {
                String message = ex.getAllErrors().stream()
                                .map(error -> error.getDefaultMessage())
                                .collect(Collectors.joining(", "));
                return badRequest(message.isBlank() ? "Validation failed" : message);
        }

        @ExceptionHandler(ConstraintViolationException.class)
        public ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException ex) {
                String message = ex.getConstraintViolations().stream()
                                .map(violation -> violation.getMessage())
                                .collect(Collectors.joining(", "));
                return badRequest(message.isBlank() ? "Validation failed" : message);
        }

        @ExceptionHandler(IllegalStateException.class)
        public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException ex) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(new ErrorResponse(HttpStatus.CONFLICT.value(), "Conflict", ex.getMessage()));
        }

        @ExceptionHandler(ResponseStatusException.class)
        public ResponseEntity<ErrorResponse> handleResponseStatus(ResponseStatusException ex) {
                HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value());
                return ResponseEntity.status(ex.getStatusCode())
                                .body(new ErrorResponse(
                                                ex.getStatusCode().value(),
                                                status != null ? status.getReasonPhrase() : "Request Error",
                                                ex.getReason() != null ? ex.getReason()
                                                                : "Request could not be completed."));
        }

        private ResponseEntity<ErrorResponse> badRequest(String message) {
                HttpStatus status = HttpStatus.BAD_REQUEST;
                return ResponseEntity.status(status)
                                .body(new ErrorResponse(status.value(), status.getReasonPhrase(), message));
        }

        // ==========================================
        // Generic Fallback Exception (500)
        // ==========================================

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiErrorResponse> handleGlobalException(Exception ex, WebRequest request) {
                logger.error("Unhandled exception occurred", ex);

                ApiErrorResponse error = new ApiErrorResponse(
                                LocalDateTime.now(),
                                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                                "Internal Server Error",
                                "An unexpected error occurred. Please try again later.",
                                request.getDescription(false).replace("uri=", ""));

                return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
}