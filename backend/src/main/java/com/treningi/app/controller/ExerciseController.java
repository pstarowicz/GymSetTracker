package com.treningi.app.controller;

import com.treningi.app.entity.Exercise;
import com.treningi.app.entity.User;
import com.treningi.app.security.CustomUserDetailsService;
import com.treningi.app.service.ExerciseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exercises")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ExerciseController {

    private final ExerciseService exerciseService;
    private final CustomUserDetailsService customUserDetailsService;

    public ExerciseController(ExerciseService exerciseService,
                            CustomUserDetailsService customUserDetailsService) {
        this.exerciseService = exerciseService;
        this.customUserDetailsService = customUserDetailsService;
    }

    @GetMapping
    public ResponseEntity<List<Exercise>> getAllExercises(@AuthenticationPrincipal UserDetails currentUser) {
        User user = customUserDetailsService.loadUserById(Long.parseLong(currentUser.getUsername()));
        return ResponseEntity.ok(exerciseService.getAllExercises(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Exercise> getExercise(@PathVariable Long id) {
        return ResponseEntity.ok(exerciseService.getExerciseById(id));
    }

    @PostMapping
    public ResponseEntity<Exercise> createExercise(@RequestBody Map<String, String> exerciseData, 
                                                 @AuthenticationPrincipal UserDetails currentUser) {
        User user = customUserDetailsService.loadUserById(Long.parseLong(currentUser.getUsername()));
        Exercise exercise = new Exercise();
        exercise.setName(exerciseData.get("name"));
        exercise.setMuscleGroup(exerciseData.get("muscleGroup"));
        exercise.setCustom(true);
        exercise.setUser(user);
        
        return ResponseEntity.ok(exerciseService.createExercise(exercise));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Exercise> updateExercise(@PathVariable Long id,
                                                 @RequestBody Map<String, String> exerciseData,
                                                 @AuthenticationPrincipal UserDetails currentUser) {
        User user = customUserDetailsService.loadUserById(Long.parseLong(currentUser.getUsername()));
        Exercise exerciseDetails = new Exercise();
        exerciseDetails.setName(exerciseData.get("name"));
        exerciseDetails.setMuscleGroup(exerciseData.get("muscleGroup"));
        
        return ResponseEntity.ok(exerciseService.updateExercise(id, exerciseDetails, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExercise(@PathVariable Long id, 
                                          @AuthenticationPrincipal UserDetails currentUser) {
        User user = customUserDetailsService.loadUserById(Long.parseLong(currentUser.getUsername()));
        exerciseService.deleteExercise(id, user);
        return ResponseEntity.ok().build();
    }
}
