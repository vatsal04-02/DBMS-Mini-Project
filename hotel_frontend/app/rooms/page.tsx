"use client";

import { useEffect, useState } from "react";

interface Room {
  roomId: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  capacity: number;
  status: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const hotelImages = [
  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
];

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/rooms`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load rooms");
        return response.json();
      })
      .then((data) => {
        setRooms(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load rooms. Is the backend running?");
        setLoading(false);
      });
  }, []);

  return (
    <main className="page-shell">
      <header className="page-header">
        <div className="animate-fade-up">
          <p className="page-eyebrow">Inventory</p>
          <h1 className="page-title">Rooms</h1>
          <p className="page-subtitle">
            Manage rooms, availability, and nightly pricing.
          </p>
        </div>
      </header>

      <section className="page-body">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-up">
          <p className="text-[var(--muted)]">
            {rooms.length} rooms in the property catalogue
          </p>
          <div className="panel px-4 py-2.5">
            <span className="text-sm text-[var(--muted)]">Total Rooms</span>
            <span className="ml-2 font-bold text-[var(--ink)]">
              {rooms.length}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-[#f0cfc6] bg-[var(--coral-soft)] px-5 py-4 text-sm text-[var(--coral)]">
            {error}
          </div>
        )}

        {loading ? (
          <div className="panel p-12 text-center text-[var(--muted)]">
            Loading rooms...
          </div>
        ) : rooms.length === 0 ? (
          <div className="panel p-12 text-center text-[var(--muted)]">
            No rooms found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room, index) => {
              const isAvailable =
                room.status.toLowerCase() === "available";

              return (
                <article
                  key={room.roomId}
                  className="panel overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow)] animate-fade-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="relative h-56 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={hotelImages[index % hotelImages.length]}
                      alt={`${room.roomType} Room`}
                      className="h-full w-full object-cover transition duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/55 via-transparent to-transparent" />

                    <div className="absolute top-4 right-4">
                      <span
                        className={`badge ${
                          isAvailable ? "badge-sage" : "badge-brass"
                        }`}
                      >
                        {room.status}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4">
                      <span className="rounded-lg bg-[var(--ink)]/70 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                        Room {room.roomNumber}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs tracking-[0.12em] text-[var(--muted)] uppercase">
                          Room Type
                        </p>
                        <h2 className="mt-1 font-display text-2xl font-semibold text-[var(--ink)]">
                          {room.roomType}
                        </h2>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-2xl font-semibold text-[var(--ink)]">
                          ₹{room.pricePerNight.toLocaleString("en-IN")}
                        </p>
                        <p className="text-xs text-[var(--muted)]">per night</p>
                      </div>
                    </div>

                    <div className="my-5 border-t border-[var(--line)]" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--muted)]">
                        Capacity {room.capacity}
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          isAvailable
                            ? "text-[var(--sage)]"
                            : "text-[var(--brass)]"
                        }`}
                      >
                        {isAvailable ? "Ready to book" : "Currently occupied"}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
