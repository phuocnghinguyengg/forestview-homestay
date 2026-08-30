package com.homestay.backend.service;

import com.homestay.backend.entity.User;
import com.homestay.backend.entity.enums.BookingStatus;
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

    public MembershipTier calculateTier(User user) {
        long bookings = bookingRepository.countByUserAndStatusIn(user, java.util.List.of(BookingStatus.CONFIRMED, BookingStatus.COMPLETED));
        BigDecimal spent = bookingRepository.sumSpentByUser(user);
        MembershipTier result = MembershipTier.NONE;
        for (MembershipTier tier : MembershipTier.values()) {
            if (tier == MembershipTier.NONE) continue;
            if (bookings >= tier.getBookingThreshold() || spent.compareTo(BigDecimal.valueOf(tier.getSpendingThreshold())) >= 0) {
                result = tier;
            }
        }
        return result;
    }

    public int discountPercent(User user) {
        return user.getMembershipTier() == null ? 0 : user.getMembershipTier().getDiscountPercent();
    }

    public void refreshAfterConfirmedBooking(User user) {
        MembershipTier calculated = calculateTier(user);
        MembershipTier current = user.getMembershipTier() == null ? MembershipTier.NONE : user.getMembershipTier();
        if (calculated.ordinal() > current.ordinal()) {
            user.setMembershipTier(calculated);
            userRepository.save(user);
            emailService.sendMembershipUpgradeEmail(user.getEmail(), user.getFullName(), calculated);
        }
    }

    public long bookingCount(User user) {
        return bookingRepository.countByUserAndStatusIn(user, java.util.List.of(BookingStatus.CONFIRMED, BookingStatus.COMPLETED));
    }

    public BigDecimal totalSpent(User user) {
        return bookingRepository.sumSpentByUser(user);
    }

    public MembershipTier nextTier(User user) {
        MembershipTier current = user.getMembershipTier() == null ? MembershipTier.NONE : user.getMembershipTier();
        MembershipTier[] values = MembershipTier.values();
        int next = current.ordinal() + 1;
        return next < values.length ? values[next] : null;
    }

    public void grant(User user, MembershipTier tier) {
        MembershipTier current = user.getMembershipTier() == null ? MembershipTier.NONE : user.getMembershipTier();
        if (tier.ordinal() < current.ordinal()) {
            throw new IllegalArgumentException("Không thể hạ cấp membership bằng thao tác này");
        }
        user.setMembershipTier(tier);
        userRepository.save(user);
        if (tier != current) emailService.sendMembershipUpgradeEmail(user.getEmail(), user.getFullName(), tier);
    }
}
