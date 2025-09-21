package com.treningi.app.repository;

import com.treningi.app.entity.Workout;
import com.treningi.app.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface WorkoutRepository extends JpaRepository<Workout, Long> {
    @Query("SELECT DISTINCT w FROM Workout w LEFT JOIN FETCH w.sets s LEFT JOIN FETCH s.exercise WHERE w.user = :user ORDER BY w.date DESC")
    Page<Workout> findByUserOrderByDateDesc(@Param("user") User user, Pageable pageable);
    
    @Query("SELECT DISTINCT w FROM Workout w LEFT JOIN FETCH w.sets s LEFT JOIN FETCH s.exercise WHERE w.user = :user AND w.date BETWEEN :start AND :end ORDER BY w.date DESC")
    List<Workout> findByUserAndDateBetweenOrderByDateDesc(@Param("user") User user, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    @Query("SELECT DISTINCT w FROM Workout w LEFT JOIN FETCH w.sets s LEFT JOIN FETCH s.exercise WHERE w.id = :id")
    Optional<Workout> findByIdWithSets(@Param("id") Long id);
}
