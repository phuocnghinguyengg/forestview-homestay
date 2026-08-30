package com.homestay.backend.service;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

/** Fixed Vietnamese public holidays plus the first 3 days of Lunar New Year for supported years. */
public final class VietnameseHolidayService {
    private VietnameseHolidayService() {}

    private static final int[][] TET = {
            {2025,1,29},{2026,2,17},{2027,2,6},{2028,1,26},{2029,2,13},
            {2030,2,3},{2031,1,23},{2032,2,11},{2033,1,31},{2034,2,19},{2035,2,8}
    };
    private static final int[][] HUNG_KINGS = {
            {2025,4,7},{2026,4,19},{2027,4,9},{2028,3,29},{2029,4,17},
            {2030,4,7},{2031,3,27},{2032,4,15},{2033,4,4},{2034,4,23},{2035,4,12}
    };

    public static Set<LocalDate> autoHolidayDatesBetween(LocalDate from, LocalDate to) {
        Set<LocalDate> result = new HashSet<>();
        for (int year = from.getYear() - 1; year <= to.getYear() + 1; year++) {
            add(result, LocalDate.of(year, 1, 1), from, to);
            add(result, LocalDate.of(year, 4, 30), from, to);
            add(result, LocalDate.of(year, 5, 1), from, to);
            add(result, LocalDate.of(year, 9, 2), from, to);
        }
        for (int[] t : TET) {
            LocalDate start = LocalDate.of(t[0], t[1], t[2]);
            for (int i = 0; i < 3; i++) add(result, start.plusDays(i), from, to);
        }
        for (int[] h : HUNG_KINGS) add(result, LocalDate.of(h[0], h[1], h[2]), from, to);
        return result;
    }

    private static void add(Set<LocalDate> set, LocalDate date, LocalDate from, LocalDate to) {
        if (!date.isBefore(from) && date.isBefore(to)) set.add(date);
    }
}
