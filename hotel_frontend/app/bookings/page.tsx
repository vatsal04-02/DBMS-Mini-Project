"use client";

import { useEffect, useState } from "react";

interface Booking {
  bookingId: number;
  guestId: number;
  roomId: number;
  checkIn: string;
  checkOut: string;
  actualCheckOut: string | null;
  numberOfGuests: number;
  totalAmount: number;
  status: string;
}

interface Guest {
  guestId: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
}

interface Room {
  roomId: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  capacity: number;
  status: string;
}


const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://hotel-backend-jsds.onrender.com";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showNewGuest, setShowNewGuest] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [creatingGuest, setCreatingGuest] = useState(false);

  const [checkingOut, setCheckingOut] =
    useState<number | null>(null);

  const [extending, setExtending] =
    useState<number | null>(null);

  const [cancelling, setCancelling] =
    useState<number | null>(null);

  const [message, setMessage] = useState("");

  const [openAction, setOpenAction] =
    useState<number | null>(null);

  const [actionType, setActionType] =
    useState<"checkout" | "extend" | null>(null);

  const [actualCheckoutDates, setActualCheckoutDates] =
    useState<Record<number, string>>({});

  const [extensionDates, setExtensionDates] =
    useState<Record<number, string>>({});

  const [formData, setFormData] = useState({
    guestId: "",
    roomId: "",
    checkIn: "",
    checkOut: "",
    numberOfGuests: "1",
  });

  const [guestForm, setGuestForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });

  // =========================
  // LOAD BOOKINGS
  // =========================

  const loadBookings = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/bookings`
      );

      if (!response.ok) {
        throw new Error("Failed to load bookings");
      }

      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error("Bookings error:", error);
      setMessage("Unable to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD GUESTS
  // =========================

  const loadGuests = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/guests`
      );

      if (!response.ok) {
        throw new Error("Failed to load guests");
      }

      const data = await response.json();
      setGuests(data);
    } catch (error) {
      console.error("Guests error:", error);
    }
  };

  // =========================
  // LOAD ROOMS
  // =========================

  const loadRooms = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/rooms`
      );

      if (!response.ok) {
        throw new Error("Failed to load rooms");
      }

      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error("Rooms error:", error);
    }
  };

  useEffect(() => {
    loadBookings();
    loadGuests();
    loadRooms();
  }, []);

  // =========================
  // CREATE NEW GUEST
  // =========================

  const createGuest = async () => {
    setMessage("");

    if (
      !guestForm.fullName ||
      !guestForm.email ||
      !guestForm.phone ||
      !guestForm.address
    ) {
      setMessage("Please fill in all guest details.");
      return;
    }

    setCreatingGuest(true);

    try {
      const response = await fetch(
        `${API_URL}/api/guests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: guestForm.fullName,
            email: guestForm.email,
            phone: guestForm.phone,
            address: guestForm.address,
          }),
        }
      );

      const result = await response.text();

      if (!response.ok) {
        throw new Error(result);
      }

      const guestsResponse = await fetch(
        `${API_URL}/api/guests`
      );

      if (!guestsResponse.ok) {
        throw new Error(
          "Guest was created but could not be loaded."
        );
      }

      const updatedGuests = await guestsResponse.json();

      setGuests(updatedGuests);

      const newGuest = updatedGuests.find(
        (guest: Guest) =>
          guest.email === guestForm.email
      );

      if (newGuest) {
        setFormData((previous) => ({
          ...previous,
          guestId: String(newGuest.guestId),
        }));
      }

      setGuestForm({
        fullName: "",
        email: "",
        phone: "",
        address: "",
      });

      setShowNewGuest(false);

      setMessage(
        result || "Guest created successfully."
      );
    } catch (error) {
      console.error(
        "Guest creation error:",
        error
      );

      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Failed to create guest.");
      }
    } finally {
      setCreatingGuest(false);
    }
  };

  // =========================
  // CREATE BOOKING
  // =========================

  const createBooking = async () => {
    setMessage("");

    if (
      !formData.guestId ||
      !formData.roomId ||
      !formData.checkIn ||
      !formData.checkOut ||
      !formData.numberOfGuests
    ) {
      setMessage(
        "Please fill in all booking details."
      );
      return;
    }

    if (formData.checkOut <= formData.checkIn) {
      setMessage(
        "Check-out date must be after check-in date."
      );
      return;
    }

    const selectedRoom = rooms.find(
      (room) =>
        room.roomId === Number(formData.roomId)
    );

    if (!selectedRoom) {
      setMessage("Please select a valid room.");
      return;
    }

    if (
      selectedRoom.status.toLowerCase() !==
      "available"
    ) {
      setMessage(
        "This room is no longer available."
      );

      await loadRooms();
      return;
    }

    if (
      Number(formData.numberOfGuests) >
      selectedRoom.capacity
    ) {
      setMessage(
        `This room can accommodate only ${selectedRoom.capacity} guests.`
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `${API_URL}/api/bookings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            guestId: Number(formData.guestId),
            roomId: Number(formData.roomId),
            checkIn: formData.checkIn,
            checkOut: formData.checkOut,
            numberOfGuests: Number(
              formData.numberOfGuests
            ),
          }),
        }
      );

      const result = await response.text();

      if (!response.ok) {
        throw new Error(result);
      }

      setMessage(result);

      await loadBookings();
      await loadRooms();

      setFormData({
        guestId: "",
        roomId: "",
        checkIn: "",
        checkOut: "",
        numberOfGuests: "1",
      });
    } catch (error) {
      console.error(
        "Booking creation error:",
        error
      );

      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage(
          "Failed to create booking."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // OPEN ACTION
  // =========================

  const openCheckout = (booking: Booking) => {
    setOpenAction(booking.bookingId);
    setActionType("checkout");

    setActualCheckoutDates(
      (previous) => ({
        ...previous,
        [booking.bookingId]:
          booking.checkOut,
      })
    );

    setMessage("");
  };

  const openExtension = (booking: Booking) => {
    setOpenAction(booking.bookingId);
    setActionType("extend");

    setExtensionDates(
      (previous) => ({
        ...previous,
        [booking.bookingId]:
          booking.checkOut,
      })
    );

    setMessage("");
  };

  const closeAction = () => {
    setOpenAction(null);
    setActionType(null);
  };

  // =========================
  // CHECKOUT
  // =========================

  const checkoutBooking = async (
    booking: Booking
  ) => {
    const actualDate =
      actualCheckoutDates[
        booking.bookingId
      ];

    if (!actualDate) {
      setMessage(
        "Please select the actual checkout date."
      );
      return;
    }

    if (actualDate < booking.checkIn) {
      setMessage(
        "Checkout date cannot be before check-in date."
      );
      return;
    }

    if (actualDate > booking.checkOut) {
      setMessage(
        "For a later date, use Extend Stay."
      );
      return;
    }

    const confirmed = window.confirm(
      `Check out ${getGuestName(
        booking.guestId
      )} on ${actualDate}?`
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setCheckingOut(booking.roomId);

    try {
      const response = await fetch(
        `${API_URL}/api/bookings/checkout/${booking.roomId}?actualCheckOut=${actualDate}`,
        {
          method: "PUT",
        }
      );

      const result = await response.text();

      if (!response.ok) {
        throw new Error(result);
      }

      setMessage(result);

      closeAction();

      await loadBookings();
      await loadRooms();
    } catch (error) {
      console.error(
        "Checkout error:",
        error
      );

      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Checkout failed.");
      }
    } finally {
      setCheckingOut(null);
    }
  };

  // =========================
  // EXTEND STAY
  // =========================

  const extendBooking = async (
    booking: Booking
  ) => {
    const newDate =
      extensionDates[
        booking.bookingId
      ];

    if (!newDate) {
      setMessage(
        "Please select a new checkout date."
      );
      return;
    }

    if (newDate <= booking.checkOut) {
      setMessage(
        "New checkout date must be after the current checkout date."
      );
      return;
    }

    const confirmed = window.confirm(
      `Extend ${getGuestName(
        booking.guestId
      )}'s stay until ${newDate}?`
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setExtending(booking.bookingId);

    try {
      const response = await fetch(
        `${API_URL}/api/bookings/extend/${booking.bookingId}?newCheckOut=${newDate}`,
        {
          method: "PUT",
        }
      );

      const result = await response.text();

      if (!response.ok) {
        throw new Error(result);
      }

      setMessage(result);

      closeAction();

      await loadBookings();
      await loadRooms();
    } catch (error) {
      console.error(
        "Extension error:",
        error
      );

      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage(
          "Failed to extend booking."
        );
      }
    } finally {
      setExtending(null);
    }
  };

  // =========================
  // CANCEL BOOKING
  // =========================

  const cancelBooking = async (
    booking: Booking
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel the booking for ${getGuestName(
        booking.guestId
      )}?`
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setCancelling(booking.bookingId);

    try {
      const response = await fetch(
        `${API_URL}/api/bookings/cancel/${booking.bookingId}`,
        {
          method: "PUT",
        }
      );

      const result = await response.text();

      if (!response.ok) {
        throw new Error(result);
      }

      setMessage(result);

      closeAction();

      await loadBookings();
      await loadRooms();
    } catch (error) {
      console.error(
        "Cancellation error:",
        error
      );

      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage(
          "Failed to cancel booking."
        );
      }
    } finally {
      setCancelling(null);
    }
  };

  // =========================
  // AVAILABLE ROOMS
  // =========================

  const availableRooms = rooms.filter(
    (room) =>
      room.status.toLowerCase() ===
      "available"
  );

  // =========================
  // HELPERS
  // =========================

  const getGuestName = (
    guestId: number
  ) => {
    const guest = guests.find(
      (guest) =>
        guest.guestId === guestId
    );

    return guest
      ? guest.fullName
      : `Guest #${guestId}`;
  };

  const getRoomInfo = (
    roomId: number
  ) => {
    const room = rooms.find(
      (room) =>
        room.roomId === roomId
    );

    return room
      ? `Room ${room.roomNumber}`
      : `Room #${roomId}`;
  };

  // =========================
  // RENDER
  // =========================

  return (
    <main className="page-shell">

      {/* HEADER */}

      <header className="page-header">

        <p className="page-eyebrow">
          Reservations
        </p>

        <h1 className="page-title">
          Bookings
        </h1>

        <p className="page-subtitle">
          Create, extend, check out, and cancel guest stays.
        </p>

      </header>

      <section className="page-body">

        {/* PAGE HEADER */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

          <p className="text-[var(--muted)]">
            View and manage all hotel reservations.
          </p>

          <div className="flex items-center gap-4">

            <div className="panel px-4 py-2.5">

              <span className="text-sm text-[var(--muted)]">
                Total Bookings
              </span>

              <span className="ml-2 font-bold text-[var(--ink)]">
                {bookings.length}
              </span>

            </div>

            <button
              onClick={() => {
                setShowForm(!showForm);
                setMessage("");
              }}
              className="btn btn-primary"
            >
              {showForm
                ? "Close Form"
                : "+ New Booking"}
            </button>

          </div>

        </div>

        {/* MESSAGE */}

        {message && (

          <div className="mb-6 panel px-5 py-4">

            <p className="text-sm font-medium text-[var(--ink)]">
              {message}
            </p>

          </div>

        )}

        {/* ========================= */}
        {/* BOOKING FORM */}
        {/* ========================= */}

        {showForm && (

          <div className="panel p-6 mb-8">

            <h2 className="font-display text-2xl font-semibold text-[var(--ink)] mb-6">
              Create New Booking
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

              {/* GUEST */}

              <div>

                <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                  Guest
                </label>

                <select
                  value={formData.guestId}
                  onChange={(e) => {

                    if (
                      e.target.value ===
                      "new"
                    ) {

                      setShowNewGuest(true);

                      setFormData({
                        ...formData,
                        guestId: "",
                      });

                      return;
                    }

                    setFormData({
                      ...formData,
                      guestId:
                        e.target.value,
                    });

                  }}
                  className="field"
                >

                  <option value="">
                    Select Guest
                  </option>

                  {guests.map(
                    (guest) => (

                      <option
                        key={
                          guest.guestId
                        }
                        value={
                          guest.guestId
                        }
                      >
                        {
                          guest.fullName
                        }
                      </option>

                    )
                  )}

                  <option value="new">
                    + Add New Guest
                  </option>

                </select>

              </div>

              {/* ROOM */}

              <div>

                <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                  Available Room
                </label>

                <select
                  value={formData.roomId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      roomId:
                        e.target.value,
                    })
                  }
                  className="field"
                >

                  <option value="">
                    Select Room
                  </option>

                  {availableRooms.map(
                    (room) => (

                      <option
                        key={
                          room.roomId
                        }
                        value={
                          room.roomId
                        }
                      >
                        Room{" "}
                        {
                          room.roomNumber
                        }{" "}
                        —{" "}
                        {
                          room.roomType
                        }{" "}
                        — ₹
                        {
                          room.pricePerNight
                        }
                        /night
                      </option>

                    )
                  )}

                </select>

              </div>

              {/* CHECK-IN */}

              <div>

                <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                  Check-in
                </label>

                <input
                  type="date"
                  value={
                    formData.checkIn
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      checkIn:
                        e.target.value,
                    })
                  }
                  className="field"
                />

              </div>

              {/* CHECK-OUT */}

              <div>

                <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                  Check-out
                </label>

                <input
                  type="date"
                  value={
                    formData.checkOut
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      checkOut:
                        e.target.value,
                    })
                  }
                  className="field"
                />

              </div>

              {/* NUMBER OF GUESTS */}

              <div>

                <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                  Number of Guests
                </label>

                <input
                  type="number"
                  min="1"
                  value={
                    formData.numberOfGuests
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      numberOfGuests:
                        e.target.value,
                    })
                  }
                  className="field"
                />

              </div>

            </div>

            {/* NEW GUEST */}

            {showNewGuest && (

              <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--mist)] p-6">

                <div className="flex items-center justify-between mb-5">

                  <div>

                    <h3 className="font-display text-xl font-semibold text-[var(--ink)]">
                      Add New Guest
                    </h3>

                    <p className="text-sm text-[var(--muted)] mt-1">
                      Enter the guest's details.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewGuest(false)
                    }
                    className="text-[var(--muted)] hover:text-[var(--ink)] text-xl"
                  >
                    ×
                  </button>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                  <div>

                    <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                      Full Name
                    </label>

                    <input
                      type="text"
                      placeholder="Enter full name"
                      value={
                        guestForm.fullName
                      }
                      onChange={(e) =>
                        setGuestForm({
                          ...guestForm,
                          fullName:
                            e.target.value,
                        })
                      }
                      className="field"
                    />

                  </div>

                  <div>

                    <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                      Email
                    </label>

                    <input
                      type="email"
                      placeholder="guest@example.com"
                      value={
                        guestForm.email
                      }
                      onChange={(e) =>
                        setGuestForm({
                          ...guestForm,
                          email:
                            e.target.value,
                        })
                      }
                      className="field"
                    />

                  </div>

                  <div>

                    <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                      Phone
                    </label>

                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={
                        guestForm.phone
                      }
                      onChange={(e) =>
                        setGuestForm({
                          ...guestForm,
                          phone:
                            e.target.value,
                        })
                      }
                      className="field"
                    />

                  </div>

                  <div>

                    <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                      Address
                    </label>

                    <input
                      type="text"
                      placeholder="Guest address"
                      value={
                        guestForm.address
                      }
                      onChange={(e) =>
                        setGuestForm({
                          ...guestForm,
                          address:
                            e.target.value,
                        })
                      }
                      className="field"
                    />

                  </div>

                </div>

                <button
                  type="button"
                  onClick={createGuest}
                  disabled={
                    creatingGuest
                  }
                  className="btn btn-brass mt-5"
                >
                  {creatingGuest
                    ? "Saving Guest..."
                    : "Save Guest"}
                </button>

              </div>

            )}

            {/* SELECTED GUEST */}

            {formData.guestId && (

              <div className="mt-5 rounded-xl bg-[var(--mist)] p-4">

                {(() => {

                  const selectedGuest =
                    guests.find(
                      (guest) =>
                        guest.guestId ===
                        Number(
                          formData.guestId
                        )
                    );

                  if (!selectedGuest)
                    return null;

                  return (

                    <div className="flex flex-wrap gap-6 text-sm">

                      <div>
                        <span className="text-[var(--muted)]">
                          Guest
                        </span>

                        <p className="font-semibold text-[var(--ink)]">
                          {
                            selectedGuest.fullName
                          }
                        </p>
                      </div>

                      <div>
                        <span className="text-[var(--muted)]">
                          Email
                        </span>

                        <p className="font-semibold text-[var(--ink)]">
                          {
                            selectedGuest.email
                          }
                        </p>
                      </div>

                      <div>
                        <span className="text-[var(--muted)]">
                          Phone
                        </span>

                        <p className="font-semibold text-[var(--ink)]">
                          {
                            selectedGuest.phone
                          }
                        </p>
                      </div>

                    </div>

                  );

                })()}

              </div>

            )}

            {/* SELECTED ROOM */}

            {formData.roomId && (

              <div className="mt-3 rounded-xl bg-[var(--mist)] p-4">

                {(() => {

                  const selectedRoom =
                    rooms.find(
                      (room) =>
                        room.roomId ===
                        Number(
                          formData.roomId
                        )
                    );

                  if (!selectedRoom)
                    return null;

                  return (

                    <div className="flex flex-wrap gap-6 text-sm">

                      <div>
                        <span className="text-[var(--muted)]">
                          Room
                        </span>

                        <p className="font-semibold text-[var(--ink)]">
                          {
                            selectedRoom.roomNumber
                          }
                        </p>
                      </div>

                      <div>
                        <span className="text-[var(--muted)]">
                          Type
                        </span>

                        <p className="font-semibold text-[var(--ink)]">
                          {
                            selectedRoom.roomType
                          }
                        </p>
                      </div>

                      <div>
                        <span className="text-[var(--muted)]">
                          Price
                        </span>

                        <p className="font-semibold text-[var(--ink)]">
                          ₹
                          {selectedRoom.pricePerNight.toLocaleString(
                            "en-IN"
                          )}
                          /night
                        </p>
                      </div>

                      <div>
                        <span className="text-[var(--muted)]">
                          Capacity
                        </span>

                        <p className="font-semibold text-[var(--ink)]">
                          {
                            selectedRoom.capacity
                          }{" "}
                          guests
                        </p>
                      </div>

                    </div>

                  );

                })()}

              </div>

            )}

            {/* CREATE */}

            <button
              type="button"
              onClick={createBooking}
              disabled={submitting}
              className="btn btn-sage mt-6"
            >
              {submitting
                ? "Creating Booking..."
                : "Create Booking"}
            </button>

          </div>

        )}

        {/* ========================= */}
        {/* BOOKINGS TABLE */}
        {/* ========================= */}

        {loading ? (

          <div className="panel p-12 text-center">

            <p className="text-[var(--muted)]">
              Loading bookings...
            </p>

          </div>

        ) : bookings.length === 0 ? (

          <div className="panel p-12 text-center">

            <p className="text-[var(--muted)]">
              No bookings found.
            </p>

          </div>

        ) : (

          <div className="panel overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="table-head">

                  <tr>

                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Booking
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Guest
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Room
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Check-in
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Check-out
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Guests
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Amount
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Status
                    </th>

                    <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {bookings.map(
                    (booking) => (

                      <tr
                        key={
                          booking.bookingId
                        }
                        className="border-b border-[var(--line)]"
                      >

                        <td
                          colSpan={9}
                          className="p-0"
                        >

                          {/* MAIN BOOKING ROW */}

                          <div className="grid grid-cols-[100px_1.5fr_1fr_1fr_1fr_90px_120px_120px_190px] items-center hover:bg-[var(--mist)] transition">

                            {/* BOOKING ID */}

                            <div className="px-6 py-5">

                              <span className="font-bold text-[var(--ink)]">
                                #
                                {
                                  booking.bookingId
                                }
                              </span>

                            </div>

                            {/* GUEST */}

                            <div className="px-6 py-5">

                              <p className="font-semibold text-[var(--ink)]">
                                {getGuestName(
                                  booking.guestId
                                )}
                              </p>

                              <p className="text-xs text-[var(--muted)]">
                                Guest #
                                {
                                  booking.guestId
                                }
                              </p>

                            </div>

                            {/* ROOM */}

                            <div className="px-6 py-5">

                              <span className="rounded-lg bg-[var(--mist-deep)] px-3 py-1.5 text-sm font-medium text-[var(--ink)]">
                                {getRoomInfo(
                                  booking.roomId
                                )}
                              </span>

                            </div>

                            {/* CHECK IN */}

                            <div className="px-6 py-5 text-sm text-[var(--muted)]">
                              {
                                booking.checkIn
                              }
                            </div>

                            {/* CHECK OUT */}

                            <div className="px-6 py-5 text-sm">

                              <p className="text-[var(--muted)]">
                                {
                                  booking.checkOut
                                }
                              </p>

                              {booking.actualCheckOut && (

                                <p className="text-xs text-[var(--sage)] mt-1">
                                  Actual:{" "}
                                  {
                                    booking.actualCheckOut
                                  }
                                </p>

                              )}

                            </div>

                            {/* GUEST COUNT */}

                            <div className="px-6 py-5 text-sm text-[var(--muted)]">
                              👥{" "}
                              {
                                booking.numberOfGuests
                              }
                            </div>

                            {/* AMOUNT */}

                            <div className="px-6 py-5 font-bold text-[var(--ink)]">

                              ₹
                              {booking.totalAmount.toLocaleString(
                                "en-IN"
                              )}

                            </div>

                            {/* STATUS */}

                            <div className="px-6 py-5">

                              {booking.status ===
                              "Confirmed" ? (

                                <span className="badge badge-sage">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--sage)]"></span>
                                  Confirmed
                                </span>

                              ) : booking.status ===
                                "Cancelled" ? (

                                <span className="badge badge-coral">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--coral)]"></span>
                                  Cancelled
                                </span>

                              ) : booking.status ===
                                "Checked Out" ? (

                                <span className="badge badge-muted">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--muted)]"></span>
                                  Checked Out
                                </span>

                              ) : (

                                <span className="badge badge-muted">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--muted)]"></span>
                                  {
                                    booking.status
                                  }
                                </span>

                              )}

                            </div>

                            {/* ACTIONS */}

                            <div className="px-6 py-5">

                              {booking.status ===
                              "Confirmed" ? (

                                <div className="flex flex-col gap-2">

                                  {/* EXTEND STAY */}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      openExtension(
                                        booking
                                      )
                                    }
                                    disabled={
                                      cancelling ===
                                      booking.bookingId ||
                                      checkingOut ===
                                      booking.roomId
                                    }
                                    className="btn btn-brass w-full text-sm py-2.5 disabled:opacity-50"
                                  >
                                    <span>↗</span>
                                    <span>
                                      Extend Stay
                                    </span>
                                  </button>

                                  {/* CHECK OUT */}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      openCheckout(
                                        booking
                                      )
                                    }
                                    disabled={
                                      cancelling ===
                                      booking.bookingId ||
                                      extending ===
                                      booking.bookingId
                                    }
                                    className="btn btn-sage w-full text-sm py-2.5 disabled:opacity-50"
                                  >
                                    <span>✓</span>
                                    <span>
                                      Check Out
                                    </span>
                                  </button>

                                  {/* CANCEL BOOKING */}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      cancelBooking(
                                        booking
                                      )
                                    }
                                    disabled={
                                      cancelling ===
                                      booking.bookingId ||
                                      checkingOut ===
                                      booking.roomId ||
                                      extending ===
                                      booking.bookingId
                                    }
                                    className="btn btn-danger w-full text-sm py-2.5 disabled:opacity-50"
                                  >
                                    {cancelling ===
                                    booking.bookingId ? (
                                      <>
                                        <span className="animate-spin">
                                          ⟳
                                        </span>
                                        <span>
                                          Cancelling...
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <span>×</span>
                                        <span>
                                          Cancel Booking
                                        </span>
                                      </>
                                    )}
                                  </button>

                                </div>

                              ) : booking.status ===
                                "Cancelled" ? (

                                <div className="flex items-center gap-2 text-sm text-[var(--coral)] font-medium">
                                  <span>×</span>
                                  <span>
                                    Booking Cancelled
                                  </span>
                                </div>

                              ) : (

                                <span className="text-sm text-[var(--muted)]">
                                  Completed
                                </span>

                              )}

                            </div>

                          </div>

                          {/* ========================= */}
                          {/* INLINE EXTEND PANEL */}
                          {/* ========================= */}

                          {openAction ===
                            booking.bookingId &&
                            actionType ===
                              "extend" && (

                            <div className="border-t border-[var(--line)] bg-[var(--brass-soft)] px-8 py-6">

                              <div className="max-w-4xl">

                                <div className="flex items-center justify-between">

                                  <div>

                                    <h3 className="font-display text-xl font-semibold text-[var(--ink)]">
                                      Extend Guest Stay
                                    </h3>

                                    <p className="text-sm text-[var(--muted)] mt-1">
                                      {
                                        getGuestName(
                                          booking.guestId
                                        )
                                      }{" "}
                                      ·{" "}
                                      {getRoomInfo(
                                        booking.roomId
                                      )}
                                    </p>

                                  </div>

                                  <button
                                    type="button"
                                    onClick={
                                      closeAction
                                    }
                                    className="text-[var(--muted)] hover:text-[var(--ink)] text-xl"
                                  >
                                    ×
                                  </button>

                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">

                                  <div>

                                    <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                                      Current Checkout
                                    </label>

                                    <input
                                      type="date"
                                      value={
                                        booking.checkOut
                                      }
                                      disabled
                                      className="field"
                                    />

                                  </div>

                                  <div>

                                    <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                                      New Checkout
                                    </label>

                                    <input
                                      type="date"
                                      value={
                                        extensionDates[
                                          booking.bookingId
                                        ] ||
                                        booking.checkOut
                                      }
                                      min={
                                        booking.checkOut
                                      }
                                      onChange={(e) =>
                                        setExtensionDates(
                                          (
                                            previous
                                          ) => ({
                                            ...previous,
                                            [booking.bookingId]:
                                              e.target.value,
                                          })
                                        )
                                      }
                                      className="field"
                                    />

                                  </div>

                                  <div>

                                    <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                                      Current Total
                                    </label>

                                    <div className="field font-bold">
                                      ₹
                                      {booking.totalAmount.toLocaleString(
                                        "en-IN"
                                      )}
                                    </div>

                                  </div>

                                </div>

                                <p className="text-xs text-[var(--muted)] mt-4">
                                  The system will check
                                  room availability before
                                  extending the booking.
                                </p>

                                <div className="flex gap-3 mt-5">

                                  <button
                                    type="button"
                                    onClick={() =>
                                      extendBooking(
                                        booking
                                      )
                                    }
                                    disabled={
                                      extending ===
                                      booking.bookingId
                                    }
                                    className="btn btn-brass"
                                  >
                                    {extending ===
                                    booking.bookingId
                                      ? "Extending..."
                                      : "Confirm Extension"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={
                                      closeAction
                                    }
                                    className="btn btn-ghost"
                                  >
                                    Cancel
                                  </button>

                                </div>

                              </div>

                            </div>

                          )}

                          {/* ========================= */}
                          {/* INLINE CHECKOUT PANEL */}
                          {/* ========================= */}

                          {openAction ===
                            booking.bookingId &&
                            actionType ===
                              "checkout" && (

                            <div className="border-t border-[var(--line)] bg-[var(--coral-soft)] px-8 py-6">

                              <div className="max-w-4xl">

                                <div className="flex items-center justify-between">

                                  <div>

                                    <h3 className="font-display text-xl font-semibold text-[var(--ink)]">
                                      Guest Checkout
                                    </h3>

                                    <p className="text-sm text-[var(--muted)] mt-1">
                                      {
                                        getGuestName(
                                          booking.guestId
                                        )
                                      }{" "}
                                      ·{" "}
                                      {getRoomInfo(
                                        booking.roomId
                                      )}
                                    </p>

                                  </div>

                                  <button
                                    type="button"
                                    onClick={
                                      closeAction
                                    }
                                    className="text-[var(--muted)] hover:text-[var(--ink)] text-xl"
                                  >
                                    ×
                                  </button>

                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">

                                  <div>

                                    <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                                      Planned Checkout
                                    </label>

                                    <input
                                      type="date"
                                      value={
                                        booking.checkOut
                                      }
                                      disabled
                                      className="field"
                                    />

                                  </div>

                                  <div>

                                    <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                                      Actual Checkout
                                    </label>

                                    <input
                                      type="date"
                                      value={
                                        actualCheckoutDates[
                                          booking.bookingId
                                        ] ||
                                        booking.checkOut
                                      }
                                      min={
                                        booking.checkIn
                                      }
                                      max={
                                        booking.checkOut
                                      }
                                      onChange={(e) =>
                                        setActualCheckoutDates(
                                          (
                                            previous
                                          ) => ({
                                            ...previous,
                                            [booking.bookingId]:
                                              e.target.value,
                                          })
                                        )
                                      }
                                      className="field"
                                    />

                                  </div>

                                  <div>

                                    <label className="block text-sm font-medium text-[var(--muted)] mb-2">
                                      Current Amount
                                    </label>

                                    <div className="field font-bold">
                                      ₹
                                      {booking.totalAmount.toLocaleString(
                                        "en-IN"
                                      )}
                                    </div>

                                  </div>

                                </div>

                                <p className="text-xs text-[var(--muted)] mt-4">
                                  If the guest leaves before
                                  the planned checkout date,
                                  the final amount will be
                                  recalculated automatically.
                                </p>

                                <div className="flex gap-3 mt-5">

                                  <button
                                    type="button"
                                    onClick={() =>
                                      checkoutBooking(
                                        booking
                                      )
                                    }
                                    disabled={
                                      checkingOut ===
                                      booking.roomId
                                    }
                                    className="btn btn-sage"
                                  >
                                    {checkingOut ===
                                    booking.roomId
                                      ? "Checking Out..."
                                      : "Confirm Checkout"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={
                                      closeAction
                                    }
                                    className="btn btn-ghost"
                                  >
                                    Cancel
                                  </button>

                                </div>

                              </div>

                            </div>

                          )}

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </section>

    </main>
  );
}