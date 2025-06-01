package com.dentalcare.service;

import com.dentalcare.model.Patient;
import com.dentalcare.repository.PatientRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class PatientService {
    private final PatientRepository patientRepository;
    
    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }
    
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }
    
    public Optional<Patient> getPatientById(Long id) {
        return patientRepository.findById(id);
    }
    
    public Patient createPatient(Patient patient) {
        return patientRepository.save(patient);
    }
    
    public Optional<Patient> updatePatient(Long id, Patient patient) {
        if (patientRepository.existsById(id)) {
            patient.setId(id);
            return Optional.of(patientRepository.save(patient));
        }
        return Optional.empty();
    }
    
    public boolean deletePatient(Long id) {
        if (patientRepository.existsById(id)) {
            patientRepository.deleteById(id);
            return true;
        }
        return false;
    }
}