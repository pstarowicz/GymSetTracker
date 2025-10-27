package com.treningi.app.controller;

import com.treningi.app.dto.PersonalRecordResponse;
import com.treningi.app.entity.User;
import com.treningi.app.security.CustomUserDetailsService;
import com.treningi.app.service.PersonalRecordService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/records")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PersonalRecordController {

    private final PersonalRecordService personalRecordService;
    private final CustomUserDetailsService customUserDetailsService;

    public PersonalRecordController(PersonalRecordService personalRecordService,
                                  CustomUserDetailsService customUserDetailsService) {
        this.personalRecordService = personalRecordService;
        this.customUserDetailsService = customUserDetailsService;
    }

    @GetMapping
    public ResponseEntity<List<PersonalRecordResponse>> getUserRecords(
            @AuthenticationPrincipal UserDetails currentUser) {
        User user = customUserDetailsService.loadUserById(Long.parseLong(currentUser.getUsername()));
        return ResponseEntity.ok(personalRecordService.getUserPersonalRecords(user));
    }

    // Removed /exercise/{exerciseId} endpoint as it's no longer needed with the new implementation
}
