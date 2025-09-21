package com.treningi.app.service;

import com.treningi.app.entity.PersonalRecord;
import com.treningi.app.entity.Exercise;
import com.treningi.app.entity.User;
import com.treningi.app.entity.WorkoutSet;
import com.treningi.app.repository.PersonalRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PersonalRecordService {
    private final PersonalRecordRepository personalRecordRepository;

    public PersonalRecordService(PersonalRecordRepository personalRecordRepository) {
        this.personalRecordRepository = personalRecordRepository;
    }

    public List<PersonalRecord> getUserPersonalRecords(User user) {
        return personalRecordRepository.findByUserOrderByDateAchievedDesc(user);
    }

    public List<PersonalRecord> getExercisePersonalRecords(User user, Exercise exercise) {
        return personalRecordRepository.findByUserAndExerciseOrderByWeightDescRepsDesc(user, exercise);
    }

    @Transactional
    public PersonalRecord checkAndCreatePersonalRecord(WorkoutSet set, User user) {
        List<PersonalRecord> existingRecords = getExercisePersonalRecords(user, set.getExercise());
        
        boolean isNewRecord = existingRecords.stream()
                .noneMatch(record -> 
                    (record.getWeight() >= set.getWeight() && record.getReps() >= set.getReps()));

        if (isNewRecord) {
            PersonalRecord newRecord = new PersonalRecord();
            newRecord.setUser(user);
            newRecord.setExercise(set.getExercise());
            newRecord.setWeight(set.getWeight());
            newRecord.setReps(set.getReps());
            newRecord.setDateAchieved(LocalDateTime.now());
            
            return personalRecordRepository.save(newRecord);
        }
        
        return null;
    }
}
