package com.homestay.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "rooms")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private BigDecimal pricePerNight;

    @Column(nullable = false)
    private Integer maxGuests;

    @Column
    @Builder.Default
    private Integer recommendedGuests = 2;

    @Column
    @Builder.Default
    private BigDecimal extraGuestFee = BigDecimal.ZERO;

    @ElementCollection
    @CollectionTable(name = "room_images", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "image_url")
    private List<String> images;

    @ElementCollection
    @CollectionTable(name = "room_amenities", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "amenity")
    private List<String> amenities;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private com.homestay.backend.entity.enums.RoomType type;

    private BigDecimal weekendPrice;
    private BigDecimal holidayPrice;

    /** Rich room information shown to guests before booking. */
    private Integer roomSize;
    private String bedConfiguration;
    private String viewDescription;
    private String bathroomDescription;
    private String floor;
    private String checkInTime;
    private String checkOutTime;

    @Column(columnDefinition = "TEXT")
    private String houseRules;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PostLoad
    protected void onLoad() {
        if (recommendedGuests == null) recommendedGuests = Math.min(2, maxGuests == null ? 2 : maxGuests);
        if (extraGuestFee == null) extraGuestFee = BigDecimal.ZERO;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
