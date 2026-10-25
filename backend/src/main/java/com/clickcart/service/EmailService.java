package com.clickcart.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendRejectionEmail(String toEmail, String providerName, List<String> reasons, String comments) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Provider Verification Request Update - ClickCart");

            StringBuilder body = new StringBuilder();
            body.append("Dear ").append(providerName != null ? providerName : "Provider").append(",\n\n");
            body.append("We regret to inform you that your provider verification request has been rejected.\n\n");

            if (reasons != null && !reasons.isEmpty()) {
                body.append("Reason(s) for rejection:\n");
                for (String reason : reasons) {
                    body.append("- ").append(reason).append("\n");
                }
                body.append("\n");
            }

            if (comments != null && !comments.trim().isEmpty()) {
                body.append("Additional Comments:\n").append(comments).append("\n\n");
            }

            body.append("Please log in to your portal, update the required details/documents, and resubmit.\n\n");
            body.append("Best Regards,\nClickCart Admin Team");

            message.setText(body.toString());
            mailSender.send(message);
            System.out.println("Rejection email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send rejection email: " + e.getMessage());
        }
    }
}