package com.treningi.app.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@NoArgsConstructor
@Entity
@Table(name = "workouts")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Workout {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "email", "createdAt", "updatedAt", "height", "weight"})
    private User user;

    @Column(nullable = false)
    private LocalDateTime date;

    private Integer duration;

    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "workout", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonIgnoreProperties("workout")
    private List<WorkoutSet> sets;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
