package com.treningi.app.controller;

import com.treningi.app.entity.User;
import com.treningi.app.security.CustomUserDetailsService;
import com.treningi.app.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    private final UserService userService;
    private final CustomUserDetailsService customUserDetailsService;

    public UserController(UserService userService, CustomUserDetailsService customUserDetailsService) {
        this.userService = userService;
        this.customUserDetailsService = customUserDetailsService;
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal UserDetails currentUser) {
        User user = customUserDetailsService.loadUserById(Long.parseLong(currentUser.getUsername()));
        return ResponseEntity.ok(user);
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateCurrentUser(
            @AuthenticationPrincipal UserDetails currentUser,
            @RequestBody User userDetails) {
        User updatedUser = userService.updateUser(Long.parseLong(currentUser.getUsername()), userDetails);
        return ResponseEntity.ok(updatedUser);
    }
}
