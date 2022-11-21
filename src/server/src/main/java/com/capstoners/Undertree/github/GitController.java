package com.capstoners.Undertree.github;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Component
@RestController
public class GitController {

	@Value("${spring.github.ci}")
	private String client_id;
	@Value("${spring.github.cs}")
	private String client_secret;

	@GetMapping("/auth/github/callback")
	public String getCallback(String code) throws JsonProcessingException {
		RestTemplate restTemplate = new RestTemplate();
		String url = "https://github.com/login/oauth/access_token";

		String requestJson = "{\"client_id\":\"" + client_id + "\", \"client_secret\":\"" + client_secret + "\", \"code\":\"" + code + "\"}";
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

		HttpEntity<String> entity = new HttpEntity<String>(requestJson, headers);
		String result = restTemplate.postForObject(url, entity, String.class);

		Map<String, String> resultMap = new ObjectMapper().readValue(result, HashMap.class);
		String access_token = resultMap.get("access_token");

		return String.format("Congrats, you finished the GitHub Authentication process! %s", access_token);
	}

}
            