package com.dentalcare.service;

import com.dentalcare.model.Medicine;
import com.dentalcare.repository.MedicineRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class MedicineService {
    private final MedicineRepository medicineRepository;
    
    public MedicineService(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }
    
    public List<Medicine> getAllMedicines() {
        return medicineRepository.findAll();
    }
    
    public Optional<Medicine> getMedicineById(Long id) {
        return medicineRepository.findById(id);
    }
    
    public Medicine createMedicine(Medicine medicine) {
        return medicineRepository.save(medicine);
    }
    
    public Optional<Medicine> updateMedicine(Long id, Medicine medicine) {
        if (medicineRepository.existsById(id)) {
            medicine.setId(id);
            return Optional.of(medicineRepository.save(medicine));
        }
        return Optional.empty();
    }
    
    public boolean deleteMedicine(Long id) {
        if (medicineRepository.existsById(id)) {
            medicineRepository.deleteById(id);
            return true;
        }
        return false;
    }
}