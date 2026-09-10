CREATE INDEX IF NOT EXISTS idx_booking_room_dates_status
    ON bookings (room_id, check_in_date, check_out_date, status);
CREATE INDEX IF NOT EXISTS idx_booking_hold_expiry
    ON bookings (status, payment_hold_expires_at);
CREATE INDEX IF NOT EXISTS idx_booking_user_created
    ON bookings (user_id, created_at);
