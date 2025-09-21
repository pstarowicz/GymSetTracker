package com.treningi.app.repository;

import com.treningi.app.entity.PersonalRecord;
import com.treningi.app.entity.User;
import com.treningi.app.entity.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PersonalRecordRepository extends JpaRepository<PersonalRecord, Long> {
    List<PersonalRecord> findByUserAndExerciseOrderByWeightDescRepsDesc(User user, Exercise exercise);
    List<PersonalRecord> findByUserOrderByDateAchievedDesc(User user);
}
