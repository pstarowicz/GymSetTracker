package com.treningi.app.service;

import com.treningi.app.entity.Exercise;
import com.treningi.app.entity.User;
import com.treningi.app.repository.ExerciseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ExerciseService {
    private final ExerciseRepository exerciseRepository;

    public ExerciseService(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    public List<Exercise> getAllExercises(User user) {
        return exerciseRepository.findByUserOrIsCustomFalse(user);
    }

    public Exercise getExerciseById(Long id) {
        return exerciseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exercise not found"));
    }

    @Transactional
    public Exercise createExercise(Exercise exercise) {
        exercise.setCustom(true);
        return exerciseRepository.save(exercise);
    }

    @Transactional
    public Exercise updateExercise(Long id, Exercise exerciseDetails, User user) {
        Exercise exercise = getExerciseById(id);
        
        // Only allow updating custom exercises that belong to the user
        if (!exercise.isCustom() || !exercise.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Cannot update this exercise");
        }
        
        if (exerciseDetails.getName() != null) {
            exercise.setName(exerciseDetails.getName());
        }
        if (exerciseDetails.getMuscleGroup() != null) {
            exercise.setMuscleGroup(exerciseDetails.getMuscleGroup());
        }
        // Preserve custom and user
        exercise.setCustom(true);
        exercise.setUser(user);

        return exerciseRepository.save(exercise);
    }

    @Transactional
    public void deleteExercise(Long id, User user) {
        Exercise exercise = getExerciseById(id);
        if (exercise.isCustom() && exercise.getUser().getId().equals(user.getId())) {
            exerciseRepository.deleteById(id);
        } else {
            throw new RuntimeException("Cannot delete this exercise");
        }
    }
}
