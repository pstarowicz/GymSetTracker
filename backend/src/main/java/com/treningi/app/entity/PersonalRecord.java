package com.treningi.app.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(name = "personal_records",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "exercise_id", "weight", "reps"}))
public class PersonalRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    private Double weight;

    private Integer reps;

    @Column(name = "date_achieved")
    private LocalDateTime dateAchieved;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (dateAchieved == null) {
            dateAchieved = LocalDateTime.now();
        }
    }
}
