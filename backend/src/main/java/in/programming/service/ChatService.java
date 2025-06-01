package in.programming.service;

import in.programming.model.ChatMessage;
import in.programming.repository.ChatMessageRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {

    private final ChatMessageRepository messageRepository;

    public ChatService(ChatMessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public ChatMessage saveMessage(ChatMessage message) {
        return messageRepository.save(message);
    }

    public List<ChatMessage> getAllMessages() {
        return messageRepository.findAll();
    }
}
