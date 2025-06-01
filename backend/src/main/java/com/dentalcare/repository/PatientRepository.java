package com.dentalcare.repository;

import com.dentalcare.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    List<Patient> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
}