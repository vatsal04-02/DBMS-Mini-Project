package com.example.demo.repository;

import com.example.demo.model.Booking;
import com.example.demo.model.BookingRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Repository
public class BookingRepository {

    private final JdbcTemplate jdbcTemplate;

    public BookingRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // =========================
    // GET ALL BOOKINGS
    // =========================

    public List<Booking> getAllBookings() {

        String sql = """
                SELECT booking_id,
                       guest_id,
                       room_id,
                       check_in,
                       check_out,
                       actual_check_out,
                       number_of_guests,
                       total_amount,
                       status
                FROM bookings
                ORDER BY booking_id DESC
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {

            Date actualCheckoutDate =
                    rs.getDate("actual_check_out");

            LocalDate actualCheckOut =
                    actualCheckoutDate != null
                            ? actualCheckoutDate.toLocalDate()
                            : null;

            return new Booking(
                    rs.getInt("booking_id"),
                    rs.getInt("guest_id"),
                    rs.getInt("room_id"),
                    rs.getDate("check_in").toLocalDate(),
                    rs.getDate("check_out").toLocalDate(),
                    actualCheckOut,
                    rs.getInt("number_of_guests"),
                    rs.getDouble("total_amount"),
                    rs.getString("status")
            );
        });
    }

    // =========================
    // CREATE BOOKING
    // =========================

    public void createBooking(
            BookingRequest request,
            double totalAmount
    ) {

        String sql = """
                INSERT INTO bookings
                (
                    guest_id,
                    room_id,
                    check_in,
                    check_out,
                    number_of_guests,
                    total_amount,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, 'Confirmed')
                """;

        jdbcTemplate.update(
                sql,
                request.getGuestId(),
                request.getRoomId(),
                request.getCheckIn(),
                request.getCheckOut(),
                request.getNumberOfGuests(),
                totalAmount
        );
    }

    // =========================
    // GET ROOM PRICE
    // =========================

    public double getRoomPrice(int roomId) {

        String sql = """
                SELECT price_per_night
                FROM rooms
                WHERE room_id = ?
                """;

        return jdbcTemplate.queryForObject(
                sql,
                Double.class,
                roomId
        );
    }

    // =========================
    // CHECK ROOM AVAILABILITY
    // =========================

    public boolean isRoomAvailable(int roomId) {

        String sql = """
                SELECT status
                FROM rooms
                WHERE room_id = ?
                """;

        String status = jdbcTemplate.queryForObject(
                sql,
                String.class,
                roomId
        );

        return "Available".equalsIgnoreCase(status);
    }

    // =========================
    // UPDATE ROOM STATUS
    // =========================

    public void updateRoomStatus(
            int roomId,
            String status
    ) {

        String sql = """
                UPDATE rooms
                SET status = ?
                WHERE room_id = ?
                """;

        jdbcTemplate.update(
                sql,
                status,
                roomId
        );
    }

    // =========================
    // CHECKOUT
    // =========================

    public void checkoutRoom(
            int roomId,
            LocalDate actualCheckOut,
            double finalAmount
    ) {

        /*
         * Update the active booking.
         */
        String bookingSql = """
                UPDATE bookings
                SET status = 'Checked Out',
                    actual_check_out = ?,
                    total_amount = ?
                WHERE room_id = ?
                  AND status = 'Confirmed'
                """;

        jdbcTemplate.update(
                bookingSql,
                actualCheckOut,
                finalAmount,
                roomId
        );

        /*
         * Make the room available.
         */
        String roomSql = """
                UPDATE rooms
                SET status = 'Available'
                WHERE room_id = ?
                """;

        jdbcTemplate.update(
                roomSql,
                roomId
        );
    }

    // =========================
    // GET ACTIVE BOOKING
    // =========================

    public Booking getActiveBooking(int roomId) {

        String sql = """
                SELECT booking_id,
                       guest_id,
                       room_id,
                       check_in,
                       check_out,
                       actual_check_out,
                       number_of_guests,
                       total_amount,
                       status
                FROM bookings
                WHERE room_id = ?
                  AND status = 'Confirmed'
                ORDER BY booking_id DESC
                LIMIT 1
                """;

        return jdbcTemplate.queryForObject(
                sql,
                (rs, rowNum) -> {

                    Date actualCheckoutDate =
                            rs.getDate("actual_check_out");

                    LocalDate actualCheckOut =
                            actualCheckoutDate != null
                                    ? actualCheckoutDate.toLocalDate()
                                    : null;

                    return new Booking(
                            rs.getInt("booking_id"),
                            rs.getInt("guest_id"),
                            rs.getInt("room_id"),
                            rs.getDate("check_in").toLocalDate(),
                            rs.getDate("check_out").toLocalDate(),
                            actualCheckOut,
                            rs.getInt("number_of_guests"),
                            rs.getDouble("total_amount"),
                            rs.getString("status")
                    );
                },
                roomId
        );
    }

    // =========================
    // EXTEND BOOKING
    // =========================

    public boolean isRoomAvailableForExtension(
            int bookingId,
            int roomId,
            LocalDate currentCheckOut,
            LocalDate newCheckOut
    ) {

        /*
         * The room is already occupied by this booking.
         * We only need to make sure another confirmed
         * booking does not overlap the extension period.
         */

        String sql = """
                SELECT COUNT(*)
                FROM bookings
                WHERE room_id = ?
                  AND booking_id <> ?
                  AND status = 'Confirmed'
                  AND check_in < ?
                  AND check_out > ?
                """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                roomId,
                bookingId,
                newCheckOut,
                currentCheckOut
        );

        return count != null && count == 0;
    }

    public void extendBooking(
            int bookingId,
            LocalDate newCheckOut,
            double newTotalAmount
    ) {

        String sql = """
                UPDATE bookings
                SET check_out = ?,
                    total_amount = ?
                WHERE booking_id = ?
                  AND status = 'Confirmed'
                """;

        jdbcTemplate.update(
                sql,
                newCheckOut,
                newTotalAmount,
                bookingId
        );
    }

    // =========================
    // CANCEL BOOKING
    // =========================

    public boolean cancelBooking(int bookingId) {

        /*
         * Find the room associated with the
         * confirmed booking.
         */
        String roomSql = """
                SELECT room_id
                FROM bookings
                WHERE booking_id = ?
                  AND status = 'Confirmed'
                """;

        Integer roomId = jdbcTemplate.queryForObject(
                roomSql,
                Integer.class,
                bookingId
        );

        if (roomId == null) {
            return false;
        }

        /*
         * Change booking status instead of
         * deleting the booking.
         */
        String bookingSql = """
                UPDATE bookings
                SET status = 'Cancelled'
                WHERE booking_id = ?
                  AND status = 'Confirmed'
                """;

        int updatedRows = jdbcTemplate.update(
                bookingSql,
                bookingId
        );

        if (updatedRows == 0) {
            return false;
        }

        /*
         * Make the room available again.
         */
        String roomStatusSql = """
                UPDATE rooms
                SET status = 'Available'
                WHERE room_id = ?
                """;

        jdbcTemplate.update(
                roomStatusSql,
                roomId
        );

        return true;
    }

    // =========================
    // DASHBOARD STATISTICS
    // =========================

    public Map<String, Object> getDashboardStats() {

        Map<String, Object> stats =
                new HashMap<>();

        Integer totalRooms =
                jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM rooms",
                        Integer.class
                );

        Integer availableRooms =
                jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM rooms WHERE status = 'Available'",
                        Integer.class
                );

        Integer occupiedRooms =
                jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM rooms WHERE status = 'Occupied'",
                        Integer.class
                );

        Integer totalGuests =
                jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM guests",
                        Integer.class
                );

        Integer totalBookings =
                jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM bookings",
                        Integer.class
                );

        /*
         * Cancelled bookings are excluded from
         * total revenue.
         */
        Double totalRevenue =
                jdbcTemplate.queryForObject(
                        """
                        SELECT COALESCE(SUM(total_amount), 0)
                        FROM bookings
                        WHERE status <> 'Cancelled'
                        """,
                        Double.class
                );

        stats.put("totalRooms", totalRooms);
        stats.put("availableRooms", availableRooms);
        stats.put("occupiedRooms", occupiedRooms);
        stats.put("totalGuests", totalGuests);
        stats.put("totalBookings", totalBookings);
        stats.put("totalRevenue", totalRevenue);

        return stats;
    }
}