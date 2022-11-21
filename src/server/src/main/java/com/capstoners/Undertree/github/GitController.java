package com.capstoners.Undertree.github;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.view.RedirectView;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Component
@RestController
@CrossOrigin(origins = "http://localhost:3000/", allowCredentials = "true")
public class GitController {

	@Value("${spring.github.ci}")
	private String client_id;
	@Value("${spring.github.cs}")
	private String client_secret;

	@GetMapping(path = "/github/code={code}")
	public Map<String, String> getUsername(@PathVariable(required=true, name="code") String code, HttpServletResponse response) throws IOException, URISyntaxException {
		RestTemplate restTemplate = new RestTemplate();
		String url = "https://github.com/login/oauth/access_token";

		String requestJson = "{\"client_id\":\"" + client_id + "\", \"client_secret\":\"" + client_secret + "\", \"code\":\"" + code + "\"}";
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

		HttpEntity<String> entity = new HttpEntity<String>(requestJson, headers);
		String result = restTemplate.postForObject(url, entity, String.class);


		Map<String, String> resultMap = new ObjectMapper().readValue(result, HashMap.class);
		String accessToken = resultMap.get("access_token");

		String userUrl = "https://api.github.com/user";
		HttpHeaders userHeaders = new HttpHeaders();
		userHeaders.setContentType(MediaType.APPLICATION_JSON);
		userHeaders.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
		userHeaders.setBearerAuth(accessToken);
		HttpEntity<Void> userEntity = new HttpEntity<>(headers);
		ResponseEntity<String> userResult = restTemplate.exchange(RequestEntity.get(new URI(userUrl)).headers(userHeaders).build(), String.class);
		Map<String, String> userResultMap = new ObjectMapper().readValue(userResult.getBody(), HashMap.class);
		String username = userResultMap.get("login");

		Cookie userCookie = new Cookie("username", username);
		userCookie.setHttpOnly(true);
		response.addCookie(userCookie);

		HashMap<String, String> map = new HashMap<>();
		map.put("username", username);
		return map;
	}





}
            