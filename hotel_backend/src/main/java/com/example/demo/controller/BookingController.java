package com.example.demo.controller;

import com.example.demo.model.Booking;
import com.example.demo.model.BookingRequest;
import com.example.demo.repository.BookingRepository;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingRepository bookingRepository;

    public BookingController(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    // =========================
    // GET ALL BOOKINGS
    // =========================

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingRepository.getAllBookings();
    }

    // =========================
    // CREATE BOOKING
    // =========================

    @PostMapping
    public String createBooking(
            @RequestBody BookingRequest request) {

        if (!bookingRepository.isRoomAvailable(
                request.getRoomId())) {

            return "Room is not available";
        }

        double pricePerNight =
                bookingRepository.getRoomPrice(
                        request.getRoomId());

        long numberOfNights =
                ChronoUnit.DAYS.between(
                        request.getCheckIn(),
                        request.getCheckOut());

        if (numberOfNights <= 0) {
            return "Check-out date must be after check-in date";
        }

        double totalAmount =
                pricePerNight * numberOfNights;

        bookingRepository.createBooking(
                request,
                totalAmount);

        bookingRepository.updateRoomStatus(
                request.getRoomId(),
                "Occupied");

        return "Booking created successfully. Total amount: ₹"
                + totalAmount;
    }

    // =========================
    // EARLY CHECKOUT
    // =========================

    @PutMapping("/checkout/{roomId}")
    public String checkout(
            @PathVariable int roomId,
            @RequestParam(required = false)
            String actualCheckOut) {

        Booking booking =
                bookingRepository.getActiveBooking(roomId);

        if (booking == null) {
            return "No active booking found for this room";
        }

        LocalDate checkoutDate;

        if (actualCheckOut == null ||
                actualCheckOut.isBlank()) {

            checkoutDate = LocalDate.now();

        } else {

            checkoutDate =
                    LocalDate.parse(actualCheckOut);
        }

        // Actual checkout cannot be before check-in
        if (checkoutDate.isBefore(
                booking.getCheckIn())) {

            return "Actual checkout cannot be before check-in date";
        }

        // Actual checkout cannot be after planned checkout
        if (checkoutDate.isAfter(
                booking.getCheckOut())) {

            return "For extending the stay, use the Extend Stay option";
        }

        double pricePerNight =
                bookingRepository.getRoomPrice(roomId);

        long nights =
                ChronoUnit.DAYS.between(
                        booking.getCheckIn(),
                        checkoutDate);

        if (nights <= 0) {
            return "Checkout date must be after check-in date";
        }

        double finalAmount =
                pricePerNight * nights;

        bookingRepository.checkoutRoom(
                roomId,
                checkoutDate,
                finalAmount);

        return "Checkout successful. Final amount: ₹"
                + finalAmount
                + ". Room is now available.";
    }

    // =========================
    // EXTEND STAY
    // =========================

    @PutMapping("/extend/{bookingId}")
    public String extendBooking(
            @PathVariable int bookingId,
            @RequestParam String newCheckOut) {

        Booking booking = null;

        for (Booking b :
                bookingRepository.getAllBookings()) {

            if (b.getBookingId() == bookingId) {
                booking = b;
                break;
            }
        }

        if (booking == null) {
            return "Booking not found";
        }

        if (!"Confirmed".equalsIgnoreCase(
                booking.getStatus())) {

            return "Only confirmed bookings can be extended";
        }

        LocalDate newCheckoutDate;

        try {

            newCheckoutDate =
                    LocalDate.parse(newCheckOut);

        } catch (Exception e) {

            return "Invalid checkout date";
        }

        if (!newCheckoutDate.isAfter(
                booking.getCheckOut())) {

            return "New checkout date must be after the current checkout date";
        }

        boolean available =
                bookingRepository
                        .isRoomAvailableForExtension(
                                booking.getBookingId(),
                                booking.getRoomId(),
                                booking.getCheckOut(),
                                newCheckoutDate);

        if (!available) {

            return "Room is already booked during the requested extension period";
        }

        double pricePerNight =
                bookingRepository.getRoomPrice(
                        booking.getRoomId());

        long totalNights =
                ChronoUnit.DAYS.between(
                        booking.getCheckIn(),
                        newCheckoutDate);

        double newTotalAmount =
                pricePerNight * totalNights;

        bookingRepository.extendBooking(
                booking.getBookingId(),
                newCheckoutDate,
                newTotalAmount);

        return "Booking extended successfully. New total amount: ₹"
                + newTotalAmount;
    }

    // =========================
    // CANCEL BOOKING
    // =========================

    @PutMapping("/cancel/{bookingId}")
    public String cancelBooking(
            @PathVariable int bookingId) {

        // Check whether booking exists
        Booking booking = null;

        for (Booking b :
                bookingRepository.getAllBookings()) {

            if (b.getBookingId() == bookingId) {
                booking = b;
                break;
            }
        }

        if (booking == null) {
            return "Booking not found";
        }

        // Only confirmed bookings can be cancelled
        if (!"Confirmed".equalsIgnoreCase(
                booking.getStatus())) {

            return "Only confirmed bookings can be cancelled";
        }

        boolean cancelled =
                bookingRepository.cancelBooking(
                        bookingId);

        if (!cancelled) {
            return "Unable to cancel booking";
        }

        return "Booking cancelled successfully. Room is now available.";
    }
}