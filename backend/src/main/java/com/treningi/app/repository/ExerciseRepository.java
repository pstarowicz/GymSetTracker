package com.treningi.app.repository;

import com.treningi.app.entity.Exercise;
import com.treningi.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    List<Exercise> findByUserOrIsCustomFalse(User user);
    List<Exercise> findByUser(User user);
}
