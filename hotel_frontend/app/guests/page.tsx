"use client";

import { useEffect, useState } from "react";

interface Guest {
  guestId: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/guests`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load guests");
        return response.json();
      })
      .then((data) => {
        setGuests(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load guests. Is the backend running?");
        setLoading(false);
      });
  }, []);

  return (
    <main className="page-shell">
      <header className="page-header">
        <div className="animate-fade-up">
          <p className="page-eyebrow">Guest directory</p>
          <h1 className="page-title">Guests</h1>
          <p className="page-subtitle">
            Registered guests and contact details for front-desk service.
          </p>
        </div>
      </header>

      <section className="page-body">
        <div className="mb-8 flex items-center justify-between animate-fade-up">
          <p className="text-[var(--muted)]">
            {guests.length} guest records on file
          </p>
          <div className="panel px-4 py-2.5">
            <span className="text-sm text-[var(--muted)]">Total Guests</span>
            <span className="ml-2 font-bold text-[var(--ink)]">
              {guests.length}
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
            Loading guests...
          </div>
        ) : guests.length === 0 ? (
          <div className="panel p-12 text-center text-[var(--muted)]">
            No guests found.
          </div>
        ) : (
          <div className="panel overflow-hidden animate-fade-up">
            <div className="table-wrap">
              <table className="w-full">
                <thead className="table-head">
                  <tr>
                    <th>Guest</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((guest) => (
                    <tr
                      key={guest.guestId}
                      className="border-b border-[var(--line)] transition hover:bg-[var(--mist)]"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[var(--ink)]">
                          {guest.fullName}
                        </p>
                        <p className="text-xs text-[var(--muted)]">
                          Guest #{guest.guestId}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-[var(--muted)]">
                        {guest.email}
                      </td>
                      <td className="px-6 py-4 text-[var(--muted)]">
                        {guest.phone}
                      </td>
                      <td className="px-6 py-4 text-[var(--muted)]">
                        {guest.address}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--muted)]">
                        {guest.createdAt
                          ? new Date(guest.createdAt).toLocaleDateString(
                              "en-IN"
                            )
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
