import { useMemo } from 'react';

const Seat = ({ seat, isSelected, onToggle }) => {
  const isBooked = seat.status === 'booked';

  let cls = 'seat';
  if (isBooked) cls += ' seat--booked';
  else if (isSelected) cls += ' seat--selected';
  else {
    const type = (seat.seat_type || 'REGULAR').toLowerCase();
    if (type === 'recliner') cls += ' seat--recliner';
    else if (type === 'premium') cls += ' seat--premium';
    else cls += ' seat--available';
  }

  return (
    <button
      className={cls}
      disabled={isBooked}
      onClick={() => !isBooked && onToggle(seat)}
      title={`${seat.seat_label} · ${seat.seat_type}${isBooked ? ' (Booked)' : ''}`}
    >
      <span className="seat__num">{seat.seat_number}</span>
    </button>
  );
};

export default Seat;
