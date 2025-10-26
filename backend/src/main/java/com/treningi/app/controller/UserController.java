package com.treningi.app.controller;

import com.treningi.app.dto.ChangePasswordRequest;
import com.treningi.app.dto.ProfileRequest;
import com.treningi.app.dto.ProfileResponse;
import com.treningi.app.entity.User;
import com.treningi.app.security.CustomUserDetailsService;
import com.treningi.app.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import jakarta.validation.Valid;
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

    @GetMapping("/me/profile")
    public ResponseEntity<ProfileResponse> getProfile(@AuthenticationPrincipal UserDetails currentUser) {
        User user = customUserDetailsService.loadUserById(Long.parseLong(currentUser.getUsername()));
        ProfileResponse profile = new ProfileResponse(user.getName(), user.getEmail(), user.getWeight(), user.getHeight());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me/profile")
    public ResponseEntity<ProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetails currentUser,
            @RequestBody ProfileRequest profileRequest) {
        User user = userService.updateUserProfile(Long.parseLong(currentUser.getUsername()), profileRequest);
        ProfileResponse profile = new ProfileResponse(user.getName(), user.getEmail(), user.getWeight(), user.getHeight());
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/me/change-password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal UserDetails currentUser,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(Long.parseLong(currentUser.getUsername()), request);
        return ResponseEntity.ok().build();
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
