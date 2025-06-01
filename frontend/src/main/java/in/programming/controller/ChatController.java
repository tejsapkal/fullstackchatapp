package in.programming.controller;

import in.programming.model.ChatMessage;
import in.programming.service.ChatService;
import in.programming.service.UserService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserService userService;

    public ChatController(ChatService chatService, SimpMessagingTemplate messagingTemplate, UserService userService) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
        this.userService = userService;
    }

    // ✅ Handle User Joining
    @MessageMapping("/join")
    public void handleUserJoin(@Payload ChatMessage message, SimpMessageHeaderAccessor headerAccessor) {
        String username = message.getUsername();
        
        userService.addUser(username);

        messagingTemplate.convertAndSend("/topic/active-users", userService.getActiveUsers());

        System.out.println("User joined: " + username);
    }

    @MessageMapping("/sendMessage")
    public void sendMessage(ChatMessage message) {
        message.setStatus("Sent");
        chatService.saveMessage(message);

        if (message.getRecipient() != null && !message.getRecipient().isEmpty()) {
            messagingTemplate.convertAndSend("/topic/private/" + message.getRecipient(), message);
            messagingTemplate.convertAndSend("/topic/private/" + message.getUsername(), message);
            message.setStatus("Delivered");  
        } else {
            messagingTemplate.convertAndSend("/topic/messages", message);
        }

        chatService.saveMessage(message);
    }

    @GetMapping("/active-users")
    public Set<String> getActiveUsers() {
        return userService.getActiveUsers();
    }
}











