package com.capstoners.Undertree.github;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
public class GitController {
	
	@PostMapping("/login")
	public String login(@RequestBody GitCredential credential) {
        return String.format("Hello %s! with password %s", credential.getUsername(), credential.getPassword());
	}

}
            