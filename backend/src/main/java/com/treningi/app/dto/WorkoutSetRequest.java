package com.treningi.app.dto;

import lombok.Data;

@Data
public class WorkoutSetRequest {
    private Long exerciseId;
    private Integer setNumber;
    private Double weight;
    private Integer reps;
}
