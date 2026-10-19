package com.clickcart.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.clickcart.dto.messaging.ConversationDetailResponse;
import com.clickcart.dto.messaging.MessageResponse;
import com.clickcart.dto.messaging.PagedMessagesResponse;
import com.clickcart.exception.AccessForbiddenException;
import com.clickcart.exception.GlobalExceptionHandler;
import com.clickcart.exception.ResourceNotFoundException;
import com.clickcart.model.SenderRole;
import com.clickcart.service.BookingEventService;
import com.clickcart.service.ConversationService;
import com.clickcart.service.MessageService;

/**
 * Regression tests for QA defects BE-013 to BE-018 (messaging endpoints returning 500).
 */
class ConversationControllerTest {

    private static final String USER_ID = "user-1";

    private ConversationService conversationService;
    private MessageService messageService;
    private MockMvc mockMvc;

    private final UsernamePasswordAuthenticationToken customer = new UsernamePasswordAuthenticationToken(
            USER_ID, null, List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")));
    private final UsernamePasswordAuthenticationToken provider = new UsernamePasswordAuthenticationToken(
            USER_ID, null, List.of(new SimpleGrantedAuthority("ROLE_SERVICE_PROVIDER")));

    @BeforeEach
    void setUp() {
        conversationService = mock(ConversationService.class);
        messageService = mock(MessageService.class);
        ConversationController controller = new ConversationController(
                conversationService, mock(BookingEventService.class), messageService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    // BE-013
    @Test
    void listConversations_withRoleAndPaging_returns200() throws Exception {
        when(conversationService.listConversations(eq(USER_ID), eq(SenderRole.CUSTOMER), any(Pageable.class)))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/conversations").param("role", "CUSTOMER").param("page", "0").param("size", "20")
                .principal(customer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void listConversations_withoutRole_derivesProviderFromAuthorities() throws Exception {
        when(conversationService.listConversations(eq(USER_ID), eq(SenderRole.PROVIDER), any(Pageable.class)))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/conversations").principal(provider))
                .andExpect(status().isOk());

        verify(conversationService).listConversations(eq(USER_ID), eq(SenderRole.PROVIDER), any(Pageable.class));
    }

    // BE-014
    @Test
    void listConversations_withInvalidRole_returns400() throws Exception {
        mockMvc.perform(get("/api/conversations").param("role", "INVALID").principal(customer))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("role must be CUSTOMER or PROVIDER"));
    }

    // BE-015
    @Test
    void conversationDetail_forParticipant_returns200() throws Exception {
        when(conversationService.getConversationDetail(eq("c1"), eq(USER_ID), anyInt(), anyInt()))
                .thenReturn(new ConversationDetailResponse("c1", USER_ID, "p1", null, null, null,
                        new PagedMessagesResponse(List.of(), 0, 20, false)));

        mockMvc.perform(get("/api/conversations/c1").principal(customer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("c1"));
    }

    @Test
    void conversationDetail_unknownId_returns404() throws Exception {
        when(conversationService.getConversationDetail(eq("missing"), eq(USER_ID), anyInt(), anyInt()))
                .thenThrow(new ResourceNotFoundException("Conversation", "missing"));

        mockMvc.perform(get("/api/conversations/missing").principal(customer))
                .andExpect(status().isNotFound());
    }

    @Test
    void conversationDetail_nonParticipant_returns403() throws Exception {
        when(conversationService.getConversationDetail(eq("c1"), eq(USER_ID), anyInt(), anyInt()))
                .thenThrow(new AccessForbiddenException("conversation", "c1"));

        mockMvc.perform(get("/api/conversations/c1").principal(customer))
                .andExpect(status().isForbidden());
    }

    // BE-016
    @Test
    void messageHistory_returns200() throws Exception {
        when(messageService.getMessages(eq("c1"), eq(USER_ID), any(Pageable.class)))
                .thenReturn(new PagedMessagesResponse(List.of(), 0, 20, false));

        mockMvc.perform(get("/api/conversations/c1/messages").param("page", "0").param("size", "20")
                .principal(customer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasMore").value(false));
    }

    @Test
    void messageHistory_nonParticipant_returns403() throws Exception {
        when(messageService.getMessages(eq("c1"), eq(USER_ID), any(Pageable.class)))
                .thenThrow(new AccessForbiddenException("conversation", "c1"));

        mockMvc.perform(get("/api/conversations/c1/messages").principal(customer))
                .andExpect(status().isForbidden());
    }

    // BE-017
    @Test
    void sendMessage_validContent_returns200() throws Exception {
        when(messageService.sendMessage(eq("c1"), eq(USER_ID), any()))
                .thenReturn(new MessageResponse("m1", "c1", USER_ID, SenderRole.CUSTOMER, "Hello!", null, null));

        mockMvc.perform(post("/api/conversations/c1/messages").principal(customer)
                .contentType(MediaType.APPLICATION_JSON).content("{\"content\":\"Hello!\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("m1"));
    }

    @Test
    void sendMessage_blankContent_returns400() throws Exception {
        mockMvc.perform(post("/api/conversations/c1/messages").principal(customer)
                .contentType(MediaType.APPLICATION_JSON).content("{\"content\":\"\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void sendMessage_missingBody_returns400() throws Exception {
        mockMvc.perform(post("/api/conversations/c1/messages").principal(customer)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    // BE-018
    @Test
    void markAsRead_returns204() throws Exception {
        mockMvc.perform(patch("/api/conversations/c1/read").principal(customer))
                .andExpect(status().isNoContent());

        verify(messageService).markAsRead("c1", USER_ID);
    }

    @Test
    void markAsRead_nonParticipant_returns403() throws Exception {
        doThrow(new AccessForbiddenException("conversation", "c1"))
                .when(messageService).markAsRead("c1", USER_ID);

        mockMvc.perform(patch("/api/conversations/c1/read").principal(customer))
                .andExpect(status().isForbidden());
    }
}
