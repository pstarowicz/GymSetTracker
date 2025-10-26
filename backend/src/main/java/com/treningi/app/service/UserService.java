package com.treningi.app.service;

import com.treningi.app.dto.ChangePasswordRequest;
import com.treningi.app.dto.ProfileRequest;
import com.treningi.app.dto.RegisterRequest;
import com.treningi.app.entity.User;
import com.treningi.app.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User createUser(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email is already taken!");
        }

        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setName(registerRequest.getName());
        user.setWeight(registerRequest.getWeight());
        user.setHeight(registerRequest.getHeight());

        return userRepository.save(user);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public User updateUserProfile(Long id, ProfileRequest profileRequest) {
        User user = getUserById(id);
        
        if (profileRequest.getName() != null) {
            user.setName(profileRequest.getName());
        }
        if (profileRequest.getEmail() != null && !profileRequest.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(profileRequest.getEmail())) {
                throw new RuntimeException("Email is already taken!");
            }
            user.setEmail(profileRequest.getEmail());
        }
        if (profileRequest.getWeight() != null) {
            user.setWeight(profileRequest.getWeight());
        }
        if (profileRequest.getHeight() != null) {
            user.setHeight(profileRequest.getHeight());
        }
        
        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);
        
        if (userDetails.getName() != null) {
            user.setName(userDetails.getName());
        }
        if (userDetails.getWeight() != null) {
            user.setWeight(userDetails.getWeight());
        }
        if (userDetails.getHeight() != null) {
            user.setHeight(userDetails.getHeight());
        }

        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = getUserById(userId);

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Verify that new password and confirmation match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("New password and confirmation do not match");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
