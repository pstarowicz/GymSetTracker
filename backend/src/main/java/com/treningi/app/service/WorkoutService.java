package com.treningi.app.service;

import com.treningi.app.dto.WorkoutRequest;
import com.treningi.app.entity.Workout;
import com.treningi.app.entity.WorkoutSet;
import com.treningi.app.entity.User;
import com.treningi.app.repository.WorkoutRepository;
import com.treningi.app.repository.WorkoutSetRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class WorkoutService {
    private final WorkoutRepository workoutRepository;
    private final WorkoutSetRepository workoutSetRepository;
    private final ExerciseService exerciseService;

    public WorkoutService(WorkoutRepository workoutRepository, 
                         WorkoutSetRepository workoutSetRepository,
                         ExerciseService exerciseService) {
        this.workoutRepository = workoutRepository;
        this.workoutSetRepository = workoutSetRepository;
        this.exerciseService = exerciseService;
    }

    public Page<Workout> getUserWorkouts(User user, Pageable pageable) {
        return workoutRepository.findByUserOrderByDateDesc(user, pageable);
    }

    public List<Workout> getUserWorkoutsBetweenDates(User user, LocalDateTime start, LocalDateTime end) {
        return workoutRepository.findByUserAndDateBetweenOrderByDateDesc(user, start, end);
    }

    public Workout getWorkoutById(Long id) {
        return workoutRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workout not found"));
    }

    @Transactional
    public Workout createWorkout(WorkoutRequest workoutRequest, User user) {
        Workout workout = new Workout();
        workout.setUser(user);
        workout.setDate(workoutRequest.getDate());
        workout.setDuration(workoutRequest.getDuration());
        workout.setNotes(workoutRequest.getNotes());
        
        final Workout savedWorkout = workoutRepository.save(workout);

        if (workoutRequest.getSets() != null) {
            workoutRequest.getSets().forEach(setRequest -> {
                WorkoutSet set = new WorkoutSet();
                set.setWorkout(savedWorkout);
                set.setExercise(exerciseService.getExerciseById(setRequest.getExerciseId()));
                set.setSetNumber(setRequest.getSetNumber());
                set.setWeight(setRequest.getWeight());
                set.setReps(setRequest.getReps());
                workoutSetRepository.save(set);
            });
        }

        return savedWorkout;
    }

    @Transactional
    public void deleteWorkout(Long id, User user) {
        Workout workout = getWorkoutById(id);
        if (workout.getUser().getId().equals(user.getId())) {
            workoutRepository.deleteById(id);
        } else {
            throw new RuntimeException("Not authorized to delete this workout");
        }
    }

    public List<WorkoutSet> getWorkoutSets(Long workoutId) {
        Workout workout = getWorkoutById(workoutId);
        return workoutSetRepository.findByWorkoutOrderBySetNumber(workout);
    }
}
