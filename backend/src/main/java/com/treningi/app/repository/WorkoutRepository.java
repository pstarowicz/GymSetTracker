package com.treningi.app.repository;

import com.treningi.app.entity.Workout;
import com.treningi.app.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface WorkoutRepository extends JpaRepository<Workout, Long> {
    Page<Workout> findByUserOrderByDateDesc(User user, Pageable pageable);
    List<Workout> findByUserAndDateBetweenOrderByDateDesc(User user, LocalDateTime start, LocalDateTime end);
}
