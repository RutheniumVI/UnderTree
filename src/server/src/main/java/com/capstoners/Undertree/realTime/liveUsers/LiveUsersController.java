package com.capstoners.Undertree.realTime.liveUsers;

import com.capstoners.Undertree.database.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:3000/", allowCredentials = "true")
public class LiveUsersController {

    private final UserService userService;

    @GetMapping("/api/user-avatar/user={userName}")
    public String getUserAvatar(@PathVariable String userName){
        return userService.getUserAvatarById(userName);
    }
}
