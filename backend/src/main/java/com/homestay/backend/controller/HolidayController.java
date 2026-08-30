package com.homestay.backend.controller;

import com.homestay.backend.dto.request.HolidayRequest;
import com.homestay.backend.entity.Holiday;
import com.homestay.backend.repository.HolidayRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/holidays")
@RequiredArgsConstructor
public class HolidayController {

    private final HolidayRepository holidayRepository;

    @GetMapping
    public ResponseEntity<List<Holiday>> getAll() {
        return ResponseEntity.ok(holidayRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Holiday> create(@Valid @RequestBody HolidayRequest request) {
        Holiday holiday = Holiday.builder().date(request.getDate()).name(request.getName()).build();
        return ResponseEntity.ok(holidayRepository.save(holiday));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        holidayRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
