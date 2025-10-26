package com.treningi.app.controller;

import com.treningi.app.dto.AuthResponse;
import com.treningi.app.dto.LoginRequest;
import com.treningi.app.dto.RegisterRequest;
import com.treningi.app.entity.User;
import com.treningi.app.security.JwtTokenProvider;
import com.treningi.app.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtTokenProvider tokenProvider;

    public AuthController(AuthenticationManager authenticationManager,
                         UserService userService,
                         JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getEmail(),
                loginRequest.getPassword()
            )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        // Get user from database to get the ID
        User user = userService.getUserByEmail(loginRequest.getEmail());
        
        // Generate token with user ID
        String jwt = tokenProvider.generateToken(authentication);
        
        return ResponseEntity.ok(AuthResponse.builder()
            .token(jwt)
            .type("Bearer")
            .userId(user.getId())
            .email(loginRequest.getEmail())
            .name(user.getName())
            .build());
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        User user = userService.createUser(registerRequest);
        
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                registerRequest.getEmail(),
                registerRequest.getPassword()
            )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        
        return ResponseEntity.ok(AuthResponse.builder()
            .token(jwt)
            .type("Bearer")
            .userId(user.getId())
            .email(user.getEmail())
            .name(user.getName())
            .build());
    }
}
