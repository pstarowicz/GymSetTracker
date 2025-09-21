package com.treningi.app.repository;

import com.treningi.app.entity.WorkoutSet;
import com.treningi.app.entity.Workout;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WorkoutSetRepository extends JpaRepository<WorkoutSet, Long> {
    List<WorkoutSet> findByWorkoutOrderBySetNumber(Workout workout);
}
