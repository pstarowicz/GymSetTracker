package com.treningi.app.service;

import com.treningi.app.dto.PersonalRecordResponse;
import com.treningi.app.entity.Exercise;
import com.treningi.app.entity.User;
import com.treningi.app.entity.WorkoutSet;
import com.treningi.app.repository.WorkoutSetRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PersonalRecordService {
    private final WorkoutSetRepository workoutSetRepository;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public PersonalRecordService(WorkoutSetRepository workoutSetRepository) {
        this.workoutSetRepository = workoutSetRepository;
    }

    public List<PersonalRecordResponse> getUserPersonalRecords(User user) {
        Map<Exercise, List<WorkoutSet>> exerciseSets = workoutSetRepository.findByWorkoutUser(user)
                .stream()
                .collect(Collectors.groupingBy(WorkoutSet::getExercise));

        return exerciseSets.entrySet().stream()
                .map(entry -> calculateRecords(entry.getKey(), entry.getValue()))
                .filter(record -> record.getMaxWeight() != null || record.getMaxVolume() != null)
                .collect(Collectors.toList());
    }

    private PersonalRecordResponse calculateRecords(Exercise exercise, List<WorkoutSet> sets) {
        PersonalRecordResponse response = new PersonalRecordResponse();
        response.setExerciseId(exercise.getId());
        response.setExerciseName(exercise.getName());

        // Calculate max weight PR
        Optional<WorkoutSet> maxWeightSet = sets.stream()
                .max(Comparator.comparing(WorkoutSet::getWeight));

        if (maxWeightSet.isPresent()) {
            WorkoutSet set = maxWeightSet.get();
            response.setMaxWeight(set.getWeight());
            response.setMaxWeightReps(set.getReps());
            response.setMaxWeightDate(set.getWorkout().getDate().format(DATE_FORMATTER));
        }

        // Calculate max volume PR (weight * reps summed per workout)
        Map<LocalDateTime, Double> workoutVolumes = sets.stream()
                .collect(Collectors.groupingBy(
                    set -> set.getWorkout().getDate(),
                    Collectors.summingDouble(set -> set.getWeight() * set.getReps())
                ));

        workoutVolumes.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .ifPresent(entry -> {
                    response.setMaxVolume(entry.getValue());
                    response.setMaxVolumeDate(entry.getKey().format(DATE_FORMATTER));
                });

        return response;
    }
}
