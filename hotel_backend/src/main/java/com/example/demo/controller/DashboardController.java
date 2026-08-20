package com.example.demo.controller;

import com.example.demo.repository.BookingRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final BookingRepository bookingRepository;

    public DashboardController(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @GetMapping("/stats")
    public Map<String, Object> getDashboardStats() {
        return bookingRepository.getDashboardStats();
    }
}