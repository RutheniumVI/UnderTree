package com.capstoners.Undertree.github;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import org.h2.util.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.client.RestTemplate;

import java.lang.reflect.Type;
import java.util.Collections;

// class GitHubResponse {
// 	private final String access_token;
// 	private final String token_type;
// 	private final String scope;

// 	public GitHubResponse(String access_token, String token_type, String scope) {
// 		this.access_token = access_token;
// 		this.token_type = token_type;
// 		this.scope = scope;
// 	}

// 	@Override
// 	public String toString() {
// 		return new StringBuilder().append("GitHubResponse{").append("access token: ")
// 				.append(access_token).append(", token type: ")
// 				.append(token_type).append(", scope: ")
// 				.append(scope).append("}").toString();
// 	}

// }

@Component
@RestController
public class GitController {

	@Value("${spring.github.ci}")
	private String client_id;
	@Value("${spring.github.cs}")
	private String client_secret;

	@GetMapping("/login")
	public String login(@RequestBody GitCredential credential) {
		return String.format("Hello %s! with password %s", credential.getUsername(), credential.getPassword());
	}
	@GetMapping("/auth/github/callback")
	public String getCallback(String code) {
		RestTemplate restTemplate = new RestTemplate();
		String url = "https://github.com/login/oauth/access_token";

		String requestJson = "{\"client_id\":\"" + client_id + "\", \"client_secret\":\"" + client_secret + "\", \"code\":\"" + code + "\"}";
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

		HttpEntity<String> entity = new HttpEntity<String>(requestJson, headers);
		String result = restTemplate.postForObject(url, entity, String.class);

		// Gson gson = new Gson();
		// String str = gson.toJson(result);
//		GitHubResponse gitHub = new GitHubResponse();
//		JsonObject obj = gson.fromJson(str, gitHub.class);


//		String test = access_code.getAsJsonArray().get(0).getAsJsonObject().get("name").getAsString();
//		String finalVal = access_code.get("access_code");
		return String.format("Congrats, you finished the GitHub Authentication process! %s", result);
	}

}
            