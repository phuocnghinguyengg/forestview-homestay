package com.homestay.backend.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class HolidayRequest {
    @NotNull @FutureOrPresent
    private LocalDate date;

    @NotBlank
    private String name;
}