package com.clickcart.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clickcart.dto.ApiResponse;
import com.clickcart.dto.NotificationResponse;
import com.clickcart.dto.UnreadCountResponse;
import com.clickcart.service.NotificationService;
import com.clickcart.service.NotificationUserResolver;
import com.clickcart.service.NotificationUserResolver.CurrentUser;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationUserResolver userResolver;

    public NotificationController(NotificationService notificationService, NotificationUserResolver userResolver) {
        this.notificationService = notificationService;
        this.userResolver = userResolver;
    }

    @GetMapping
    public ApiResponse<List<NotificationResponse>> list(Principal principal) {
        CurrentUser user = userResolver.requireCurrentUser(principal);
        return ApiResponse.ok(notificationService.listForUser(user.id()));
    }

    @GetMapping("/unread-count")
    public ApiResponse<UnreadCountResponse> unreadCount(Principal principal) {
        CurrentUser user = userResolver.requireCurrentUser(principal);
        return ApiResponse.ok(notificationService.unreadCount(user.id()));
    }

    @PatchMapping("/{id}/read")
    public ApiResponse<NotificationResponse> markRead(Principal principal, @PathVariable("id") String id) {
        CurrentUser user = userResolver.requireCurrentUser(principal);
        return ApiResponse.ok(notificationService.markRead(user.id(), id));
    }
}
