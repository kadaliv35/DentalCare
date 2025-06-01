
package com.dentalcare.service;

import com.dentalcare.model.*;
import com.dentalcare.repository.*;
import org.springframework.stereotype.Service;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final PharmacySaleRepository pharmacySaleRepository;
    private final MedicineRepository medicineRepository;
    
    public ReportService(
            PatientRepository patientRepository,
            AppointmentRepository appointmentRepository,
            PharmacySaleRepository pharmacySaleRepository,
            MedicineRepository medicineRepository) {
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.pharmacySaleRepository = pharmacySaleRepository;
        this.medicineRepository = medicineRepository;
    }
    
    public Map<String, Object> getPatientStatistics(String period, LocalDate startDate, LocalDate endDate) {
        Map<String, Object> stats = new HashMap<>();
        
        // Get all patients within the date range
        List<Patient> patients = patientRepository.findByCreatedAtBetween(startDate.atStartOfDay(), endDate.atTime(23, 59, 59));
        
        // Calculate basic stats
        stats.put("totalPatients", patientRepository.count());
        stats.put("newPatients", patients.size());
        
        // Calculate returning patients (patients with more than one appointment)
        long returningPatients = appointmentRepository.countPatientsWithMultipleAppointments(startDate, endDate);
        stats.put("returningPatients", returningPatients);
        
        // Calculate average age
        double averageAge = patients.stream()
                .mapToLong(p -> ChronoUnit.YEARS.between(p.getDateOfBirth(), LocalDate.now()))
                .average()
                .orElse(0);
        stats.put("averageAge", averageAge);
        
        // Calculate gender distribution
        Map<String, Long> genderDistribution = patients.stream()
                .collect(Collectors.groupingBy(Patient::getGender, Collectors.counting()));
        stats.put("genderDistribution", genderDistribution);
        
        // Calculate monthly trends
        List<Map<String, Object>> monthlyTrends = calculateMonthlyTrends(startDate, endDate);
        stats.put("monthlyTrends", monthlyTrends);
        
        return stats;
    }
    
    public Map<String, Object> getAppointmentStatistics(String period, LocalDate startDate, LocalDate endDate) {
        Map<String, Object> stats = new HashMap<>();
        
        // Get all appointments within the date range
        List<Appointment> appointments = appointmentRepository.findByDateBetween(startDate, endDate);
        
        // Calculate basic stats
        stats.put("totalAppointments", appointments.size());
        
        // Calculate status distribution
        Map<String, Long> statusCounts = appointments.stream()
                .collect(Collectors.groupingBy(Appointment::getStatus, Collectors.counting()));
        
        stats.put("completedAppointments", statusCounts.getOrDefault("completed", 0L));
        stats.put("cancelledAppointments", statusCounts.getOrDefault("cancelled", 0L));
        stats.put("noShowAppointments", statusCounts.getOrDefault("no-show", 0L));
        
        // Calculate type distribution
        Map<String, Long> typeDistribution = appointments.stream()
                .collect(Collectors.groupingBy(Appointment::getType, Collectors.counting()));
        stats.put("typeDistribution", typeDistribution);
        
        // Calculate monthly trends
        List<Map<String, Object>> monthlyTrends = calculateAppointmentTrends(startDate, endDate);
        stats.put("monthlyTrends", monthlyTrends);
        
        return stats;
    }
    
    public Map<String, Object> getFinancialStatistics(String period, LocalDate startDate, LocalDate endDate) {
        Map<String, Object> stats = new HashMap<>();
        
        // Get all appointments and pharmacy sales within the date range
        List<Appointment> appointments = appointmentRepository.findByDateBetween(startDate, endDate);
        List<PharmacySale> pharmacySales = pharmacySaleRepository.findByCreatedAtBetween(
                startDate.atStartOfDay(), endDate.atTime(23, 59, 59));
        
        // Calculate revenue
        double appointmentRevenue = appointments.stream()
                .mapToDouble(a -> a.getAmount() != null ? a.getAmount() : 0.0)
                .sum();
        
        double pharmacyRevenue = pharmacySales.stream()
                .mapToDouble(PharmacySale::getTotal)
                .sum();
        
        stats.put("totalRevenue", appointmentRevenue + pharmacyRevenue);
        stats.put("appointmentRevenue", appointmentRevenue);
        stats.put("pharmacyRevenue", pharmacyRevenue);
        
        // Calculate average values
        stats.put("averageAppointmentValue", appointments.isEmpty() ? 0 :
                appointmentRevenue / appointments.size());
        stats.put("averagePharmacySale", pharmacySales.isEmpty() ? 0 :
                pharmacyRevenue / pharmacySales.size());
        
        // Calculate monthly trends
        List<Map<String, Object>> monthlyTrends = calculateFinancialTrends(startDate, endDate);
        stats.put("monthlyTrends", monthlyTrends);
        
        // Calculate top procedures
        List<Map<String, Object>> topProcedures = calculateTopProcedures(appointments);
        stats.put("topProcedures", topProcedures);
        
        return stats;
    }
    
    public Map<String, Object> getPharmacyStatistics(String period, LocalDate startDate, LocalDate endDate) {
        Map<String, Object> stats = new HashMap<>();
        
        // Get all pharmacy sales within the date range
        List<PharmacySale> sales = pharmacySaleRepository.findByCreatedAtBetween(
                startDate.atStartOfDay(), endDate.atTime(23, 59, 59));
        
        // Calculate basic stats
        stats.put("totalSales", sales.size());
        double totalRevenue = sales.stream().mapToDouble(PharmacySale::getTotal).sum();
        stats.put("totalRevenue", totalRevenue);
        stats.put("averageSaleValue", sales.isEmpty() ? 0 : totalRevenue / sales.size());
        
        // Calculate top selling medicines
        List<Object[]> topMedicines = pharmacySaleRepository.getTopSellingMedicines(
                startDate.atStartOfDay(), endDate.atTime(23, 59, 59));
        
        List<Map<String, Object>> topSellingMedicines = topMedicines.stream()
                .map(row -> {
                    Map<String, Object> medicine = new HashMap<>();
                    medicine.put("medicineId", row[0]);
                    medicine.put("medicineName", row[1]);
                    medicine.put("quantity", row[2]);
                    medicine.put("revenue", row[3]);
                    return medicine;
                })
                .collect(Collectors.toList());
        
        stats.put("topSellingMedicines", topSellingMedicines);
        
        // Calculate monthly trends
        List<Map<String, Object>> monthlyTrends = new ArrayList<>();
        YearMonth start = YearMonth.from(startDate);
        YearMonth end = YearMonth.from(endDate);
        
        while (!start.isAfter(end)) {
            LocalDateTime monthStart = start.atDay(1).atStartOfDay();
            LocalDateTime monthEnd = start.atEndOfMonth().atTime(23, 59, 59);
            
            List<PharmacySale> monthlySales = sales.stream()
                    .filter(sale -> !sale.getCreatedAt().isBefore(monthStart) && !sale.getCreatedAt().isAfter(monthEnd))
                    .collect(Collectors.toList());
            
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("date", start.toString());
            monthData.put("sales", monthlySales.size());
            monthData.put("revenue", monthlySales.stream().mapToDouble(PharmacySale::getTotal).sum());
            monthlyTrends.add(monthData);
            
            start = start.plusMonths(1);
        }
        stats.put("monthlyTrends", monthlyTrends);
        
        // Get stock alerts
        List<Medicine> medicines = medicineRepository.findAll();
        List<Map<String, Object>> stockAlerts = medicines.stream()
                .filter(m -> m.getStock() <= 20) // Alert threshold
                .map(m -> {
                    Map<String, Object> alert = new HashMap<>();
                    alert.put("medicineId", m.getId());
                    alert.put("medicineName", m.getName());
                    alert.put("currentStock", m.getStock());
                    alert.put("reorderPoint", 20); // Reorder threshold
                    return alert;
                })
                .collect(Collectors.toList());
        
        stats.put("stockAlerts", stockAlerts);
        
        return stats;
    }
    
    private List<Map<String, Object>> calculateMonthlyTrends(LocalDate startDate, LocalDate endDate) {
        List<Map<String, Object>> trends = new ArrayList<>();
        YearMonth start = YearMonth.from(startDate);
        YearMonth end = YearMonth.from(endDate);
        
        while (!start.isAfter(end)) {
            LocalDateTime monthStart = start.atDay(1).atStartOfDay();
            LocalDateTime monthEnd = start.atEndOfMonth().atTime(23, 59, 59);
            
            List<Patient> newPatients = patientRepository.findByCreatedAtBetween(monthStart, monthEnd);
            long returningPatients = appointmentRepository.countPatientsWithMultipleAppointments(
                    start.atDay(1), start.atEndOfMonth());
            
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("date", start.toString());
            monthData.put("newPatients", newPatients.size());
            monthData.put("returningPatients", returningPatients);
            trends.add(monthData);
            
            start = start.plusMonths(1);
        }
        
        return trends;
    }
    
    private List<Map<String, Object>> calculateAppointmentTrends(LocalDate startDate, LocalDate endDate) {
        List<Map<String, Object>> trends = new ArrayList<>();
        YearMonth start = YearMonth.from(startDate);
        YearMonth end = YearMonth.from(endDate);
        
        while (!start.isAfter(end)) {
            LocalDate monthStart = start.atDay(1);
            LocalDate monthEnd = start.atEndOfMonth();
            
            List<Appointment> monthlyAppointments = appointmentRepository.findByDateBetween(monthStart, monthEnd);
            
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("date", start.toString());
            monthData.put("total", monthlyAppointments.size());
            monthData.put("completed", monthlyAppointments.stream()
                    .filter(a -> "completed".equals(a.getStatus()))
                    .count());
            monthData.put("cancelled", monthlyAppointments.stream()
                    .filter(a -> "cancelled".equals(a.getStatus()))
                    .count());
            monthData.put("noShow", monthlyAppointments.stream()
                    .filter(a -> "no-show".equals(a.getStatus()))
                    .count());
            
            trends.add(monthData);
            start = start.plusMonths(1);
        }
        
        return trends;
    }
    
    private List<Map<String, Object>> calculateFinancialTrends(LocalDate startDate, LocalDate endDate) {
        List<Map<String, Object>> trends = new ArrayList<>();
        YearMonth start = YearMonth.from(startDate);
        YearMonth end = YearMonth.from(endDate);
        
        while (!start.isAfter(end)) {
            LocalDate monthStart = start.atDay(1);
            LocalDate monthEnd = start.atEndOfMonth();
            LocalDateTime monthStartTime = monthStart.atStartOfDay();
            LocalDateTime monthEndTime = monthEnd.atTime(23, 59, 59);
            
            List<Appointment> appointments = appointmentRepository.findByDateBetween(monthStart, monthEnd);
            List<PharmacySale> sales = pharmacySaleRepository.findByCreatedAtBetween(monthStartTime, monthEndTime);
            
            double appointmentRevenue = appointments.stream()
                    .mapToDouble(a -> a.getAmount() != null ? a.getAmount() : 0.0)
                    .sum();
            double pharmacyRevenue = sales.stream()
                    .mapToDouble(PharmacySale::getTotal)
                    .sum();
            
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("date", start.toString());
            monthData.put("totalRevenue", appointmentRevenue + pharmacyRevenue);
            monthData.put("appointmentRevenue", appointmentRevenue);
            monthData.put("pharmacyRevenue", pharmacyRevenue);
            
            trends.add(monthData);
            start = start.plusMonths(1);
        }
        
        return trends;
    }
    
    private List<Map<String, Object>> calculateTopProcedures(List<Appointment> appointments) {
        return appointments.stream()
                .collect(Collectors.groupingBy(
                        Appointment::getType,
                        Collectors.collectingAndThen(
                                Collectors.toList(),
                                list -> {
                                    Map<String, Object> stats = new HashMap<>();
                                    stats.put("type", list.get(0).getType());
                                    stats.put("count", list.size());
                                    stats.put("revenue", list.stream()
                                            .mapToDouble(a -> a.getAmount() != null ? a.getAmount() : 0.0)
                                            .sum());
                                    return stats;
                                }
                        )
                ))
                .values()
                .stream()
                .sorted((a, b) -> Double.compare((Double) b.get("revenue"), (Double) a.get("revenue")))
                .collect(Collectors.toList());
    }
}
