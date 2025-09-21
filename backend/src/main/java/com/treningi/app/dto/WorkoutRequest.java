package com.treningi.app.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class WorkoutRequest {
    private LocalDateTime date;
    private Integer duration;
    private String notes;
    private List<WorkoutSetRequest> sets;
}
