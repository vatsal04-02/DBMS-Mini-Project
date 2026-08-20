package com.example.demo.controller;

import com.example.demo.model.Guest;
import com.example.demo.repository.GuestRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/guests")
@CrossOrigin(origins = "*")
public class GuestController {

    private final GuestRepository guestRepository;

    public GuestController(GuestRepository guestRepository) {
        this.guestRepository = guestRepository;
    }

    @GetMapping
    public List<Guest> getAllGuests() {
        return guestRepository.getAllGuests();
    }

    @PostMapping
    public String createGuest(@RequestBody Guest guest) {
        guestRepository.createGuest(guest);
        return "Guest created successfully";
    }
}