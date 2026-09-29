package com.clickcart.exception;

<<<<<<< HEAD
public class ResourceNotFoundException extends RuntimeException {
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
=======
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {
>>>>>>> dev
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
