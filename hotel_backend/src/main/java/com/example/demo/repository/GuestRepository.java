package com.example.demo.repository;

import com.example.demo.model.Guest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class GuestRepository {

    private final JdbcTemplate jdbcTemplate;

    public GuestRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Guest> getAllGuests() {

        String sql = """
                SELECT guest_id,
                       full_name,
                       email,
                       phone,
                       address,
                       created_at
                FROM guests
                ORDER BY guest_id DESC
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) ->
                new Guest(
                        rs.getInt("guest_id"),
                        rs.getString("full_name"),
                        rs.getString("email"),
                        rs.getString("phone"),
                        rs.getString("address"),
                        rs.getTimestamp("created_at").toLocalDateTime()
                )
        );
    }

    public void createGuest(Guest guest) {

        String sql = """
                INSERT INTO guests (
                    full_name,
                    email,
                    phone,
                    address
                )
                VALUES (?, ?, ?, ?)
                """;

        try {

            jdbcTemplate.update(
                    sql,
                    guest.getFullName(),
                    guest.getEmail(),
                    guest.getPhone(),
                    guest.getAddress()
            );

        } catch (Exception e) {

            e.printStackTrace();

            throw e;
        }
    }
}