package com.example.demo.repository;

import com.example.demo.model.Room;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class RoomRepository {

    private final JdbcTemplate jdbcTemplate;

    public RoomRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Room> getAllRooms() {

        String sql = """
                SELECT room_id,
                       room_number,
                       room_type,
                       price_per_night,
                       capacity,
                       image_url,
                       status
                FROM rooms
                ORDER BY room_id
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) ->
                new Room(
                        rs.getInt("room_id"),
                        rs.getString("room_number"),
                        rs.getString("room_type"),
                        rs.getDouble("price_per_night"),
                        rs.getInt("capacity"),
                        rs.getString("image_url"),
                        rs.getString("status")
                )
        );
    }

    public List<Room> getAvailableRooms() {

        String sql = """
                SELECT room_id,
                       room_number,
                       room_type,
                       price_per_night,
                       capacity,
                       image_url,
                       status
                FROM rooms
                WHERE status = 'Available'
                ORDER BY room_id
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) ->
                new Room(
                        rs.getInt("room_id"),
                        rs.getString("room_number"),
                        rs.getString("room_type"),
                        rs.getDouble("price_per_night"),
                        rs.getInt("capacity"),
                        rs.getString("image_url"),
                        rs.getString("status")
                )
        );
    }
}