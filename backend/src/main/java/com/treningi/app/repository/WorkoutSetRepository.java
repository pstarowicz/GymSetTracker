package com.treningi.app.repository;

import com.treningi.app.entity.WorkoutSet;
import com.treningi.app.entity.Workout;
import com.treningi.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface WorkoutSetRepository extends JpaRepository<WorkoutSet, Long> {
    List<WorkoutSet> findByWorkoutOrderBySetNumber(Workout workout);
    void deleteByWorkout(Workout workout);
    
    @Query("SELECT ws FROM WorkoutSet ws WHERE ws.workout.user = ?1")
    List<WorkoutSet> findByWorkoutUser(User user);
}
