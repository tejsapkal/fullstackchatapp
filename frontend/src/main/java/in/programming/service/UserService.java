package in.programming.service;

import org.springframework.stereotype.Service;
import in.programming.model.User;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserService {

    private final Set<String> activeUsers = Collections.newSetFromMap(new ConcurrentHashMap<>());

    public void addUser(String username) {
        activeUsers.add(username);
    }

    public void removeUser(String username) {
        activeUsers.remove(username);
    }

    public Set<String> getActiveUsers() {
        return activeUsers;
    }

    public List<User> getAllUsers() {
        return List.of();  
    }

    public void saveUser(User user) {
        
    }
}
