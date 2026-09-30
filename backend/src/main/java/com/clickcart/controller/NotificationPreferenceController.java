package com.clickcart.controller;

import java.security.Principal;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clickcart.dto.ApiResponse;
import com.clickcart.dto.NotificationPreferencesResponse;
import com.clickcart.dto.UpdateNotificationPreferencesRequest;
import com.clickcart.service.NotificationService;
import com.clickcart.service.NotificationUserResolver;
import com.clickcart.service.NotificationUserResolver.CurrentUser;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/notification-preferences")
public class NotificationPreferenceController {

    private final NotificationService notificationService;
    private final NotificationUserResolver userResolver;

    public NotificationPreferenceController(NotificationService notificationService,
            NotificationUserResolver userResolver) {
        this.notificationService = notificationService;
        this.userResolver = userResolver;
    }

    @GetMapping
    public ApiResponse<NotificationPreferencesResponse> getPreferences(Principal principal) {
        CurrentUser user = userResolver.requireCurrentUser(principal);
        return ApiResponse.ok(notificationService.preferencesFor(user.id(), user.role()));
    }

    @PutMapping
    public ApiResponse<NotificationPreferencesResponse> savePreferences(
            Principal principal,
            @Valid @RequestBody UpdateNotificationPreferencesRequest request) {
        CurrentUser user = userResolver.requireCurrentUser(principal);
        return ApiResponse.ok(notificationService.savePreferences(user.id(), user.role(), request.getEnabled()));
    }
}
