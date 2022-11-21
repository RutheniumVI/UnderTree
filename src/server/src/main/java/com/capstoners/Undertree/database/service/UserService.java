package com.capstoners.Undertree.database.service;

import com.capstoners.Undertree.database.model.User;
import com.capstoners.Undertree.database.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@AllArgsConstructor
@Service
public class UserService {

    private final UserRepository repo;

    public void saveAndUpdateUser(String userName, String token, String avatar){
        User user = new User(userName, token, avatar);
        repo.save(user);
    }

    public String getUserAvatarById(String userName){
        Optional<User> userOptional = repo.findById(userName);
        return userOptional.get().getAvatarUrl();
    }
}
