package com.homestay.backend.service;

import com.homestay.backend.entity.User;
import com.homestay.backend.entity.enums.MembershipTier;
import com.homestay.backend.repository.BookingRepository;
import com.homestay.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class MembershipService {
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public MembershipTier calculateTier(long bookings, BigDecimal spending) {
        long money = spending == null ? 0 : spending.longValue();
        MembershipTier result = MembershipTier.NONE;
        for (MembershipTier tier : MembershipTier.values()) {
            if (tier == MembershipTier.NONE) continue;
            if (bookings >= tier.getBookingThreshold() || money >= tier.getSpendingThreshold()) result = tier;
        }
        return result;
    }

    public void refreshTier(User user) {
        long bookings = bookingRepository.countSuccessfulByUser(user);
        BigDecimal spending = bookingRepository.sumSuccessfulByUser(user);
        MembershipTier calculated = calculateTier(bookings, spending);
        MembershipTier current = user.getMembershipTier() == null ? MembershipTier.NONE : user.getMembershipTier();
        if (calculated.ordinal() > current.ordinal()) {
            user.setMembershipTier(calculated);
            userRepository.save(user);
            emailService.sendMembershipUpgradeEmail(user.getEmail(), user.getFullName(), calculated);
        }
    }

    public void notifyManualUpgrade(User user, MembershipTier tier) {
        emailService.sendMembershipUpgradeEmail(user.getEmail(), user.getFullName(), tier);
    }

    public MembershipProgress progress(User user) {
        long bookings = bookingRepository.countSuccessfulByUser(user);
        BigDecimal spending = bookingRepository.sumSuccessfulByUser(user);
        MembershipTier tier = user.getMembershipTier() == null ? MembershipTier.NONE : user.getMembershipTier();
        MembershipTier next = nextTier(tier);
        long bookingTarget = next == null ? tier.getBookingThreshold() : next.getBookingThreshold();
        long spendingTarget = next == null ? tier.getSpendingThreshold() : next.getSpendingThreshold();
        long bookingPct = bookingTarget == 0 ? 100 : Math.min(100, bookings * 100 / bookingTarget);
        long spendingPct = spendingTarget == 0 ? 100 : Math.min(100, spending.longValue() * 100 / spendingTarget);
        return new MembershipProgress(tier, bookings, bookingTarget, bookingPct, spending.longValue(), spendingTarget, spendingPct, next);
    }

    public MembershipTier nextTier(MembershipTier tier) {
        if (tier == null || tier == MembershipTier.NONE) return MembershipTier.BRONZE;
        int next = tier.ordinal() + 1;
        return next < MembershipTier.values().length ? MembershipTier.values()[next] : null;
    }

    public record MembershipProgress(MembershipTier tier, long bookingCount, long bookingTarget, long bookingProgressPercent,
                                     long spendingVnd, long spendingTargetVnd, long spendingProgressPercent, MembershipTier nextTier) {}
}
