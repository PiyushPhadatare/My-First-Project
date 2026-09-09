const DateSelector = ({ dates, selectedDate, onSelect }) => {
  return (
    <div className="date-selector">
      {dates.map((date) => {
        const d = new Date(date);
        const isSelected = date === selectedDate;
        return (
          <button
            key={date}
            className={`date-btn ${isSelected ? 'date-btn-active' : ''}`}
            onClick={() => onSelect(date)}
          >
            <span className="date-day">
              {d.toLocaleDateString('en-IN', { weekday: 'short' })}
            </span>
            <span className="date-num">
              {d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default DateSelector;

