package com.treningi.app.controller;

import com.treningi.app.dto.WorkoutRequest;
import com.treningi.app.entity.User;
import com.treningi.app.entity.Workout;
import com.treningi.app.entity.WorkoutSet;
import com.treningi.app.security.CustomUserDetailsService;
import com.treningi.app.service.WorkoutService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/workouts")
@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600)
public class WorkoutController {

    private final WorkoutService workoutService;
    private final CustomUserDetailsService customUserDetailsService;

    public WorkoutController(WorkoutService workoutService,
                           CustomUserDetailsService customUserDetailsService) {
        this.workoutService = workoutService;
        this.customUserDetailsService = customUserDetailsService;
    }

    @GetMapping
    public ResponseEntity<Page<Workout>> getUserWorkouts(
            @AuthenticationPrincipal UserDetails currentUser,
            Pageable pageable) {
        User user = customUserDetailsService.loadUserById(Long.parseLong(currentUser.getUsername()));
        return ResponseEntity.ok(workoutService.getUserWorkouts(user, pageable));
    }

    @GetMapping("/between")
    public ResponseEntity<?> getWorkoutsBetweenDates(
            @AuthenticationPrincipal UserDetails currentUser,
            @RequestParam String start,
            @RequestParam String end) {
        try {
            User user = customUserDetailsService.loadUserById(Long.parseLong(currentUser.getUsername()));
            
            // Parse dates using DateTimeFormatter
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
            LocalDateTime startDate = LocalDateTime.parse(start, formatter);
            LocalDateTime endDate = LocalDateTime.parse(end, formatter);
            
            System.out.println("Received dates - Start: " + startDate + ", End: " + endDate);
            System.out.println("Current user: " + currentUser.getUsername());
            
            List<Workout> workouts = workoutService.getUserWorkoutsBetweenDates(user, startDate, endDate);
            return ResponseEntity.ok(workouts);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/date")
    public ResponseEntity<?> getWorkoutsByDate(
            @AuthenticationPrincipal UserDetails currentUser,
            @RequestParam String date) {
        try {
            User user = customUserDetailsService.loadUserById(Long.parseLong(currentUser.getUsername()));
            
            // Parse date using DateTimeFormatter
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
            LocalDateTime startDate = LocalDateTime.parse(date, formatter);
            LocalDateTime endDate = startDate.plusDays(1);
            
            List<Workout> workouts = workoutService.getUserWorkoutsBetweenDates(user, startDate, endDate);
            return ResponseEntity.ok(workouts);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Workout> getWorkout(@PathVariable Long id) {
        return ResponseEntity.ok(workoutService.getWorkoutById(id));
    }

    @GetMapping("/{id}/sets")
    public ResponseEntity<List<WorkoutSet>> getWorkoutSets(@PathVariable Long id) {
        return ResponseEntity.ok(workoutService.getWorkoutSets(id));
    }

    @PostMapping
    public ResponseEntity<Workout> createWorkout(
            @RequestBody WorkoutRequest workoutRequest,
            @AuthenticationPrincipal UserDetails currentUser) {
        User user = customUserDetailsService.loadUserById(Long.parseLong(currentUser.getUsername()));
        return ResponseEntity.ok(workoutService.createWorkout(workoutRequest, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Workout> updateWorkout(
            @PathVariable Long id,
            @RequestBody WorkoutRequest workoutRequest,
            @AuthenticationPrincipal UserDetails currentUser) {
        User user = customUserDetailsService.loadUserById(Long.parseLong(currentUser.getUsername()));
        return ResponseEntity.ok(workoutService.updateWorkout(id, workoutRequest, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWorkout(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails currentUser) {
        User user = customUserDetailsService.loadUserById(Long.parseLong(currentUser.getUsername()));
        workoutService.deleteWorkout(id, user);
        return ResponseEntity.ok().build();
    }
}
