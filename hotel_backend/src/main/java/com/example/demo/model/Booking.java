package com.example.demo.model;

import java.time.LocalDate;

public class Booking {

    private int bookingId;
    private int guestId;
    private int roomId;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private LocalDate actualCheckOut;
    private int numberOfGuests;
    private double totalAmount;
    private String status;

    public Booking() {
    }

    public Booking(
            int bookingId,
            int guestId,
            int roomId,
            LocalDate checkIn,
            LocalDate checkOut,
            LocalDate actualCheckOut,
            int numberOfGuests,
            double totalAmount,
            String status) {

        this.bookingId = bookingId;
        this.guestId = guestId;
        this.roomId = roomId;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.actualCheckOut = actualCheckOut;
        this.numberOfGuests = numberOfGuests;
        this.totalAmount = totalAmount;
        this.status = status;
    }

    public int getBookingId() {
        return bookingId;
    }

    public void setBookingId(int bookingId) {
        this.bookingId = bookingId;
    }

    public int getGuestId() {
        return guestId;
    }

    public void setGuestId(int guestId) {
        this.guestId = guestId;
    }

    public int getRoomId() {
        return roomId;
    }

    public void setRoomId(int roomId) {
        this.roomId = roomId;
    }

    public LocalDate getCheckIn() {
        return checkIn;
    }

    public void setCheckIn(LocalDate checkIn) {
        this.checkIn = checkIn;
    }

    public LocalDate getCheckOut() {
        return checkOut;
    }

    public void setCheckOut(LocalDate checkOut) {
        this.checkOut = checkOut;
    }

    public LocalDate getActualCheckOut() {
        return actualCheckOut;
    }

    public void setActualCheckOut(LocalDate actualCheckOut) {
        this.actualCheckOut = actualCheckOut;
    }

    public int getNumberOfGuests() {
        return numberOfGuests;
    }

    public void setNumberOfGuests(int numberOfGuests) {
        this.numberOfGuests = numberOfGuests;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}