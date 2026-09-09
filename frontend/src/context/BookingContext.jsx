import { createContext, useContext, useState } from 'react';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [selectedShow, setSelectedShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [booking, setBooking] = useState(null);

  const toggleSeat = (seat) => {
    setSelectedSeats((prev) => {
      const exists = prev.find((s) => s.seat_id === seat.seat_id);
      if (exists) return prev.filter((s) => s.seat_id !== seat.seat_id);
      return [...prev, seat];
    });
  };

  const clearBooking = () => {
    setSelectedShow(null);
    setSelectedSeats([]);
    setBooking(null);
  };

  return (
    <BookingContext.Provider value={{
      selectedShow, setSelectedShow,
      selectedSeats, setSelectedSeats, toggleSeat,
      booking, setBooking,
      clearBooking,
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);

