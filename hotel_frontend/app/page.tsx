"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  totalGuests: number;
  totalBookings: number;
  totalRevenue: number;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    totalGuests: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setError("");

      const response = await fetch(`${API_URL}/api/dashboard/stats`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load dashboard data.");
      }

      const data = await response.json();

      setStats({
        totalRooms: data.totalRooms ?? 0,
        availableRooms: data.availableRooms ?? 0,
        occupiedRooms: data.occupiedRooms ?? 0,
        totalGuests: data.totalGuests ?? 0,
        totalBookings: data.totalBookings ?? 0,
        totalRevenue: data.totalRevenue ?? 0,
      });
    } catch {
      setError("Unable to connect to the hotel backend.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const refreshDashboard = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const occupancyRate =
    stats.totalRooms > 0
      ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100)
      : 0;

  const availablePercentage =
    stats.totalRooms > 0
      ? Math.round((stats.availableRooms / stats.totalRooms) * 100)
      : 0;

  return (
    <main className="page-shell">
      <header className="page-header">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="animate-fade-up">
            <p className="page-eyebrow">Operations overview</p>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">
              Live occupancy, revenue, and guest activity for Grand Horizon.
            </p>
          </div>

          <div className="flex items-center gap-3 animate-fade-up-delay-1">
            <button
              onClick={refreshDashboard}
              disabled={refreshing}
              className="btn btn-ghost"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            <div className="rounded-[0.85rem] bg-[var(--ink)] px-4 py-2.5 text-sm font-semibold text-[#f3ebe2]">
              Administrator
            </div>
          </div>
        </div>
      </header>

      <section className="page-body">
        {error && (
          <div className="mb-6 rounded-2xl border border-[#f0cfc6] bg-[var(--coral-soft)] px-5 py-4 animate-fade-up">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-[var(--coral)]">
                  Dashboard connection error
                </p>
                <p className="mt-1 text-sm text-[var(--coral)]/80">{error}</p>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Start the Spring Boot backend on port 8080, then retry.
                </p>
              </div>
              <button onClick={refreshDashboard} className="btn btn-brass">
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="panel p-6 animate-fade-up">
            <p className="text-sm font-medium text-[var(--muted)]">Total Rooms</p>
            <p className="stat-value mt-3">
              {loading ? "—" : stats.totalRooms}
            </p>
            <p className="mt-2 text-xs text-[var(--muted)]">Hotel inventory</p>
          </div>

          <div className="panel p-6 animate-fade-up-delay-1">
            <p className="text-sm font-medium text-[var(--muted)]">
              Available Rooms
            </p>
            <p className="stat-value mt-3 text-[var(--sage)]">
              {loading ? "—" : stats.availableRooms}
            </p>
            <p className="mt-2 text-xs text-[var(--sage)]">
              {availablePercentage}% ready to book
            </p>
          </div>

          <div className="panel p-6 animate-fade-up-delay-2">
            <p className="text-sm font-medium text-[var(--muted)]">
              Occupied Rooms
            </p>
            <p className="stat-value mt-3 text-[var(--brass)]">
              {loading ? "—" : stats.occupiedRooms}
            </p>
            <p className="mt-2 text-xs text-[var(--brass)]">
              {occupancyRate}% occupancy
            </p>
          </div>

          <div className="panel p-6 animate-fade-up-delay-3">
            <p className="text-sm font-medium text-[var(--muted)]">
              Total Revenue
            </p>
            <p className="mt-4 font-display text-3xl font-semibold text-[var(--ink)]">
              ₹
              {loading
                ? "—"
                : stats.totalRevenue.toLocaleString("en-IN")}
            </p>
            <p className="mt-2 text-xs text-[var(--muted)]">Booking revenue</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="panel flex items-center justify-between p-6 animate-fade-up">
            <div>
              <p className="text-sm font-medium text-[var(--muted)]">
                Total Guests
              </p>
              <p className="stat-value mt-2 text-[var(--ink)]">
                {loading ? "—" : stats.totalGuests}
              </p>
            </div>
            <span className="badge badge-sage">Registered</span>
          </div>

          <div className="panel flex items-center justify-between p-6 animate-fade-up-delay-1">
            <div>
              <p className="text-sm font-medium text-[var(--muted)]">
                Total Bookings
              </p>
              <p className="stat-value mt-2 text-[var(--ink)]">
                {loading ? "—" : stats.totalBookings}
              </p>
            </div>
            <span className="badge badge-brass">All time</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="panel p-7 xl:col-span-2 animate-fade-up">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--muted)]">
                  Room Occupancy
                </p>
                <h2 className="mt-1 font-display text-4xl font-semibold text-[var(--ink)]">
                  {occupancyRate}%
                </h2>
              </div>
              <p className="text-sm text-[var(--muted)]">
                <span className="font-semibold text-[var(--ink)]">
                  {stats.occupiedRooms}
                </span>{" "}
                of {stats.totalRooms} rooms occupied
              </p>
            </div>

            <div className="progress-track mt-7">
              <div
                className="progress-fill"
                style={{ width: `${occupancyRate}%` }}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-8">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--brass)]" />
                <span className="text-sm text-[var(--muted)]">Occupied</span>
                <span className="text-sm font-bold text-[var(--ink)]">
                  {stats.occupiedRooms}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--sage)]" />
                <span className="text-sm text-[var(--muted)]">Available</span>
                <span className="text-sm font-bold text-[var(--ink)]">
                  {stats.availableRooms}
                </span>
              </div>
            </div>
          </div>

          <div className="panel-ink p-7 animate-fade-up-delay-1">
            <p className="text-sm text-white/50">Operations</p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-[#f3ebe2]">
              Quick Actions
            </h2>

            <div className="mt-6 space-y-3">
              <Link
                href="/bookings"
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/10 px-4 py-4 transition hover:bg-white/15"
              >
                <span className="font-semibold">New Booking</span>
                <span className="text-[#c9a06e]">→</span>
              </Link>
              <Link
                href="/rooms"
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/10 px-4 py-4 transition hover:bg-white/15"
              >
                <span className="font-semibold">Manage Rooms</span>
                <span className="text-[#c9a06e]">→</span>
              </Link>
              <Link
                href="/guests"
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/10 px-4 py-4 transition hover:bg-white/15"
              >
                <span className="font-semibold">Manage Guests</span>
                <span className="text-[#c9a06e]">→</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="panel mt-5 p-7 animate-fade-up">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--muted)]">
                Hotel Status
              </p>
              <h2 className="mt-1 font-display text-3xl font-semibold text-[var(--ink)]">
                Today&apos;s Overview
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--sage)] animate-pulse-dot" />
              <span className="text-sm font-semibold text-[var(--sage)]">
                System Operational
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-[var(--mist)] p-5">
              <p className="text-sm text-[var(--muted)]">Room Availability</p>
              <p className="mt-2 font-display text-2xl font-semibold text-[var(--ink)]">
                {stats.availableRooms} rooms
              </p>
              <p className="mt-1 text-xs text-[var(--sage)]">Ready for booking</p>
            </div>
            <div className="rounded-xl bg-[var(--mist)] p-5">
              <p className="text-sm text-[var(--muted)]">Active Occupancy</p>
              <p className="mt-2 font-display text-2xl font-semibold text-[var(--ink)]">
                {stats.occupiedRooms} rooms
              </p>
              <p className="mt-1 text-xs text-[var(--brass)]">Currently occupied</p>
            </div>
            <div className="rounded-xl bg-[var(--mist)] p-5">
              <p className="text-sm text-[var(--muted)]">Guest Records</p>
              <p className="mt-2 font-display text-2xl font-semibold text-[var(--ink)]">
                {stats.totalGuests} guests
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">Registered guests</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 text-sm text-[var(--muted)] md:flex-row md:items-center md:justify-between">
          <p>Grand Horizon Hotel · Management Dashboard</p>
          <p>
            {stats.totalBookings} total bookings · ₹
            {stats.totalRevenue.toLocaleString("en-IN")} revenue
          </p>
        </div>
      </section>
    </main>
  );
}
