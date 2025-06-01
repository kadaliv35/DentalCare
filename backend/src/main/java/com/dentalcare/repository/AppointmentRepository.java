
package com.dentalcare.repository;

import com.dentalcare.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByDate(LocalDate date);
    List<Appointment> findByDateBetween(LocalDate startDate, LocalDate endDate);
    List<Appointment> findByPatientId(Long patientId);
    
    @Query("SELECT COUNT(DISTINCT a.patientId) FROM Appointment a " +
           "WHERE a.date BETWEEN ?1 AND ?2 " +
           "GROUP BY a.patientId HAVING COUNT(a) > 1")
    long countPatientsWithMultipleAppointments(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT a.type, COUNT(a) as count, SUM(a.amount) as revenue " +
           "FROM Appointment a " +
           "WHERE a.date BETWEEN ?1 AND ?2 " +
           "GROUP BY a.type")
    List<Object[]> getAppointmentTypeStats(LocalDate startDate, LocalDate endDate);
}
