package com.treningi.app.controller;

import com.treningi.app.entity.Exercise;
import com.treningi.app.entity.PersonalRecord;
import com.treningi.app.entity.User;
import com.treningi.app.security.CustomUserDetailsService;
import com.treningi.app.service.ExerciseService;
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
    private final ExerciseService exerciseService;
    private final CustomUserDetailsService customUserDetailsService;

    public PersonalRecordController(PersonalRecordService personalRecordService,
                                  ExerciseService exerciseService,
                                  CustomUserDetailsService customUserDetailsService) {
        this.personalRecordService = personalRecordService;
        this.exerciseService = exerciseService;
        this.customUserDetailsService = customUserDetailsService;
    }

    @GetMapping
    public ResponseEntity<List<PersonalRecord>> getUserRecords(
            @AuthenticationPrincipal UserDetails currentUser) {
        User user = customUserDetailsService.loadUserById(Long.parseLong(currentUser.getUsername()));
        return ResponseEntity.ok(personalRecordService.getUserPersonalRecords(user));
    }

    @GetMapping("/exercise/{exerciseId}")
    public ResponseEntity<List<PersonalRecord>> getExerciseRecords(
            @PathVariable Long exerciseId,
            @AuthenticationPrincipal UserDetails currentUser) {
        User user = customUserDetailsService.loadUserById(Long.parseLong(currentUser.getUsername()));
        Exercise exercise = exerciseService.getExerciseById(exerciseId);
        return ResponseEntity.ok(personalRecordService.getExercisePersonalRecords(user, exercise));
    }
}
