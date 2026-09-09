-- =====================================================================
-- CineBook — PostgreSQL Seed Data
-- =====================================================================

-- 1. USERS
-- Both accounts use the password: "password123"
INSERT INTO users (user_name, phone_number, email, password_hash, role) VALUES
('Admin User', '9876543210', 'admin@cinebook.com', '$2b$10$XwYj2Q4mO/3.W3Z7/6YgQO.zF1bH/l6F9P5rG2xLzK8U9o4VjT.5C', 'admin'),
('John Doe', '1234567890', 'john@example.com', '$2b$10$XwYj2Q4mO/3.W3Z7/6YgQO.zF1bH/l6F9P5rG2xLzK8U9o4VjT.5C', 'customer');

-- 2. THEATERS
INSERT INTO theaters (name, city_location, total_screens) VALUES
('Cineplex City Center', 'Mumbai', 2),
('Starlight Cinemas', 'Mumbai', 2);

-- 3. SCREENS (2 per theater)
INSERT INTO screens (theater_id, screen_number, screen_type, total_capacity) VALUES
(1, 1, 'IMAX', 20),
(1, 2, '2D', 20),
(2, 1, '3D', 20),
(2, 2, '2D', 20);

-- 4. SEATS (A 4x5 grid of 20 seats for Screen 1 and Screen 2)
-- Screen 1
INSERT INTO seats (screen_id, seat_label, row_label, seat_number, seat_type) VALUES
(1, 'A1', 'A', 1, 'RECLINER'), (1, 'A2', 'A', 2, 'RECLINER'), (1, 'A3', 'A', 3, 'RECLINER'), (1, 'A4', 'A', 4, 'RECLINER'), (1, 'A5', 'A', 5, 'RECLINER'),
(1, 'B1', 'B', 1, 'PREMIUM'), (1, 'B2', 'B', 2, 'PREMIUM'), (1, 'B3', 'B', 3, 'PREMIUM'), (1, 'B4', 'B', 4, 'PREMIUM'), (1, 'B5', 'B', 5, 'PREMIUM'),
(1, 'C1', 'C', 1, 'REGULAR'), (1, 'C2', 'C', 2, 'REGULAR'), (1, 'C3', 'C', 3, 'REGULAR'), (1, 'C4', 'C', 4, 'REGULAR'), (1, 'C5', 'C', 5, 'REGULAR'),
(1, 'D1', 'D', 1, 'REGULAR'), (1, 'D2', 'D', 2, 'REGULAR'), (1, 'D3', 'D', 3, 'REGULAR'), (1, 'D4', 'D', 4, 'REGULAR'), (1, 'D5', 'D', 5, 'REGULAR');

-- Screen 2
INSERT INTO seats (screen_id, seat_label, row_label, seat_number, seat_type) VALUES
(2, 'A1', 'A', 1, 'RECLINER'), (2, 'A2', 'A', 2, 'RECLINER'), (2, 'A3', 'A', 3, 'RECLINER'), (2, 'A4', 'A', 4, 'RECLINER'), (2, 'A5', 'A', 5, 'RECLINER'),
(2, 'B1', 'B', 1, 'PREMIUM'), (2, 'B2', 'B', 2, 'PREMIUM'), (2, 'B3', 'B', 3, 'PREMIUM'), (2, 'B4', 'B', 4, 'PREMIUM'), (2, 'B5', 'B', 5, 'PREMIUM'),
(2, 'C1', 'C', 1, 'REGULAR'), (2, 'C2', 'C', 2, 'REGULAR'), (2, 'C3', 'C', 3, 'REGULAR'), (2, 'C4', 'C', 4, 'REGULAR'), (2, 'C5', 'C', 5, 'REGULAR'),
(2, 'D1', 'D', 1, 'REGULAR'), (2, 'D2', 'D', 2, 'REGULAR'), (2, 'D3', 'D', 3, 'REGULAR'), (2, 'D4', 'D', 4, 'REGULAR'), (2, 'D5', 'D', 5, 'REGULAR');

-- 5. MOVIES
INSERT INTO movies (name, language, release_date, duration_minutes, genre, description, poster_url) VALUES
('Inception', 'English', '2010-07-16', 148, 'Sci-Fi', 'A thief who steals corporate secrets through the use of dream-sharing technology...', 'https://example.com/inception.jpg'),
('The Dark Knight', 'English', '2008-07-18', 152, 'Action', 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham...', 'https://example.com/darkknight.jpg'),
('Interstellar', 'English', '2014-11-07', 169, 'Sci-Fi', 'A team of explorers travel through a wormhole in space in an attempt to ensure humanitys survival...', 'https://example.com/interstellar.jpg');

-- 6. SHOWS (Scheduled dynamically for "Today" and "Tomorrow")
INSERT INTO shows (movie_id, screen_id, show_date, show_time, show_duration, ticket_price) VALUES
(1, 1, CURRENT_DATE, '14:00:00', 148, 250.00),
(2, 2, CURRENT_DATE, '18:00:00', 152, 200.00),
(3, 1, CURRENT_DATE + INTERVAL '1 day', '20:00:00', 169, 300.00);

-- 7. BOOKINGS
-- John Doe books 2 tickets for Inception on Screen 1
INSERT INTO bookings (user_id, show_id, booking_date, total_tickets, total_amount, booking_status) VALUES
(2, 1, NOW() - INTERVAL '1 hour', 2, 500.00, 'CONFIRMED');

-- 8. BOOKING_SEATS
-- Claiming seats A1 (seat_id = 1) and A2 (seat_id = 2) for the booking.
-- Note: Trigger B ensures these seats actually belong to Screen 1.
INSERT INTO booking_seats (booking_id, show_id, seat_id, seat_status) VALUES
(1, 1, 1, 'ACTIVE'),
(1, 1, 2, 'ACTIVE');

-- 9. PAYMENTS
-- Simulating a successful Razorpay test transaction
INSERT INTO payments (booking_id, amount, payment_time, payment_status, payment_method, gateway_order_id, gateway_payment_id) VALUES
(1, 500.00, NOW() - INTERVAL '55 minutes', 'SUCCESS', 'UPI', 'order_demo_12345', 'pay_demo_12345');