package com.treningi.app.dto;

import lombok.Data;
import java.util.List;
import java.time.LocalDateTime;

@Data
public class ExerciseHistoryResponse {
    private Long exerciseId;
    private String date;
    private Double maxWeight;
    private Integer maxWeightReps;
    private Double volume;
    private List<String> volumeSets; // Format: "weight×reps"
}