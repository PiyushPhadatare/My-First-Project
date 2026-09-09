import { useMemo } from 'react';
import Seat from './Seat';

const SeatLayout = ({ seats, selectedSeats, onToggle, ticketPrice }) => {
  // Group seats by row_label, sorted by seat_number
  const rows = useMemo(() => {
    const map = {};
    seats.forEach((seat) => {
      if (!map[seat.row_label]) map[seat.row_label] = [];
      map[seat.row_label].push(seat);
    });
    // Sort each row by seat_number
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.seat_number - b.seat_number));
    // Sort rows alphabetically
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [seats]);

  // Determine seat type sections for labeling
  const seatTypeSections = useMemo(() => {
    const sections = [];
    let lastType = null;
    rows.forEach(([rowLabel, rowSeats]) => {
      const type = rowSeats[0]?.seat_type || 'REGULAR';
      if (type !== lastType) {
        sections.push({ type, startRow: rowLabel });
        lastType = type;
      }
    });
    return sections;
  }, [rows]);

  const getSectionForRow = (rowLabel) => {
    let current = null;
    for (const s of seatTypeSections) {
      if (s.startRow <= rowLabel) current = s;
    }
    return current;
  };

  // Count stats
  const totalSeats = seats.length;
  const bookedCount = seats.filter((s) => s.status === 'booked').length;
  const availableCount = totalSeats - bookedCount;

  return (
    <div className="cinema-layout">
      {/* Legend */}
      <div className="cinema-legend">
        <div className="legend-item">
          <span className="legend-swatch legend-swatch--available" />
          <span>Available</span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch legend-swatch--selected" />
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch legend-swatch--booked" />
          <span>Booked</span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch legend-swatch--recliner" />
          <span>Recliner</span>
        </div>
        <div className="legend-item">
          <span className="legend-swatch legend-swatch--premium" />
          <span>Premium</span>
        </div>
      </div>

      {/* Seat availability counter */}
      <div className="cinema-stats">
        <span>{availableCount} available</span>
        <span className="cinema-stats__divider">·</span>
        <span>{bookedCount} booked</span>
        <span className="cinema-stats__divider">·</span>
        <span className="cinema-stats__selected">
          {selectedSeats.length} selected
          {selectedSeats.length > 0 && ticketPrice &&
            ` · ₹${(parseFloat(ticketPrice) * selectedSeats.length).toFixed(0)}`
          }
        </span>
      </div>

      {/* Seat Grid */}
      <div className="cinema-grid">
        {rows.map(([rowLabel, rowSeats], rowIdx) => {
          const section = getSectionForRow(rowLabel);
          const isFirstOfSection = section?.startRow === rowLabel;

          return (
            <div key={rowLabel}>
              {/* Section divider label */}
              {isFirstOfSection && (
                <div className="cinema-section-label">
                  {section.type === 'RECLINER' && '👑 '}
                  {section.type === 'PREMIUM' && '⭐ '}
                  {section.type} — ₹{ticketPrice || '—'}
                </div>
              )}
              <div className="cinema-row">
                <span className="cinema-row__label">{rowLabel}</span>
                <div className="cinema-row__seats">
                  {rowSeats.map((seat) => (
                    <Seat
                      key={seat.seat_id}
                      seat={seat}
                      isSelected={selectedSeats.some((s) => s.seat_id === seat.seat_id)}
                      onToggle={onToggle}
                    />
                  ))}
                </div>
                <span className="cinema-row__label">{rowLabel}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Screen Indicator */}
      <div className="cinema-screen">
        <div className="cinema-screen__bar" />
        <span className="cinema-screen__text">SCREEN THIS WAY</span>
      </div>
    </div>
  );
};

export default SeatLayout;
