-- =====================================================================
-- CineBook — PostgreSQL Schema
-- =====================================================================

DROP TABLE IF EXISTS payments       CASCADE;
DROP TABLE IF EXISTS booking_seats   CASCADE;
DROP TABLE IF EXISTS bookings       CASCADE;
DROP TABLE IF EXISTS shows          CASCADE;
DROP TABLE IF EXISTS movies         CASCADE;
DROP TABLE IF EXISTS seats          CASCADE;
DROP TABLE IF EXISTS screens        CASCADE;
DROP TABLE IF EXISTS theaters       CASCADE;
DROP TABLE IF EXISTS users          CASCADE;

-- 1. USERS
CREATE TABLE users (
    user_id         SERIAL PRIMARY KEY,
    user_name       VARCHAR(100)  NOT NULL,
    phone_number    VARCHAR(15)   NOT NULL,
    email           VARCHAR(150)  NOT NULL,
    password_hash   VARCHAR(255)  NOT NULL,
    role            VARCHAR(20)   NOT NULL DEFAULT 'customer',
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT ck_users_role  CHECK (role IN ('customer', 'admin'))
);

-- 2. THEATERS
CREATE TABLE theaters (
    theater_id      SERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    city_location   VARCHAR(100) NOT NULL,
    total_screens   INT          NOT NULL DEFAULT 0 CHECK (total_screens >= 0)
);

-- 3. SCREENS
CREATE TABLE screens (
    screen_id       SERIAL PRIMARY KEY,
    theater_id      INT          NOT NULL REFERENCES theaters(theater_id) ON DELETE CASCADE,
    screen_number   INT          NOT NULL,
    screen_type     VARCHAR(20)  NOT NULL DEFAULT '2D',
    total_capacity  INT          NOT NULL CHECK (total_capacity > 0),

    CONSTRAINT uq_screens_theater_screennum UNIQUE (theater_id, screen_number),
    CONSTRAINT ck_screens_type CHECK (screen_type IN ('2D', '3D', 'IMAX', '4DX'))
);
CREATE INDEX idx_screens_theater_id ON screens(theater_id);

-- 4. SEATS
CREATE TABLE seats (
    seat_id         SERIAL PRIMARY KEY,
    screen_id       INT          NOT NULL REFERENCES screens(screen_id) ON DELETE CASCADE,
    seat_label      VARCHAR(10)  NOT NULL,
    row_label       VARCHAR(5)   NOT NULL,
    seat_number     INT          NOT NULL,
    seat_type       VARCHAR(20)  NOT NULL DEFAULT 'REGULAR',

    CONSTRAINT uq_seats_screen_label UNIQUE (screen_id, seat_label),
    CONSTRAINT ck_seats_type CHECK (seat_type IN ('REGULAR', 'PREMIUM', 'RECLINER'))
);
CREATE INDEX idx_seats_screen_id ON seats(screen_id);

-- 5. MOVIES
CREATE TABLE movies (
    movie_id         SERIAL PRIMARY KEY,
    name             VARCHAR(200) NOT NULL,
    language         VARCHAR(50)  NOT NULL,
    release_date     DATE         NOT NULL,
    duration_minutes INT          NOT NULL CHECK (duration_minutes > 0),
    genre            VARCHAR(100) NOT NULL,
    description      TEXT,
    poster_url       VARCHAR(255)
);

-- 6. SHOWS
CREATE TABLE shows (
    show_id         SERIAL PRIMARY KEY,
    movie_id        INT           NOT NULL REFERENCES movies(movie_id)   ON DELETE CASCADE,
    screen_id       INT           NOT NULL REFERENCES screens(screen_id) ON DELETE CASCADE,
    show_date       DATE          NOT NULL,
    show_time       TIME          NOT NULL,
    show_duration   INT           NOT NULL CHECK (show_duration > 0),
    ticket_price    NUMERIC(8,2)  NOT NULL CHECK (ticket_price > 0)
);
CREATE INDEX idx_shows_movie_date  ON shows(movie_id, show_date);
CREATE INDEX idx_shows_screen_date ON shows(screen_id, show_date);

-- 7. BOOKINGS
CREATE TABLE bookings (
    booking_id      SERIAL PRIMARY KEY,
    user_id         INT           NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    show_id         INT           NOT NULL REFERENCES shows(show_id) ON DELETE CASCADE,
    booking_date    TIMESTAMP     NOT NULL DEFAULT NOW(),
    total_tickets   INT           NOT NULL CHECK (total_tickets > 0),
    total_amount    NUMERIC(10,2) NOT NULL CHECK (total_amount > 0),
    booking_status  VARCHAR(20)   NOT NULL DEFAULT 'PENDING_PAYMENT',

    CONSTRAINT ck_bookings_status CHECK (
        booking_status IN ('PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'PAYMENT_FAILED')
    )
);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_show_id ON bookings(show_id);

-- 8. BOOKING_SEATS
CREATE TABLE booking_seats (
    booking_seat_id SERIAL PRIMARY KEY,
    booking_id      INT          NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    show_id         INT          NOT NULL REFERENCES shows(show_id)       ON DELETE CASCADE,
    seat_id         INT          NOT NULL REFERENCES seats(seat_id)       ON DELETE CASCADE,
    seat_status     VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_booking_seats_status CHECK (seat_status IN ('ACTIVE', 'CANCELLED'))
);

CREATE UNIQUE INDEX uq_active_seat_per_show
    ON booking_seats(show_id, seat_id)
    WHERE seat_status = 'ACTIVE';

CREATE INDEX idx_booking_seats_show_seat ON booking_seats(show_id, seat_id);
CREATE INDEX idx_booking_seats_booking_id ON booking_seats(booking_id);

-- 9. PAYMENTS
CREATE TABLE payments (
    payment_id          SERIAL PRIMARY KEY,
    booking_id          INT           NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    amount              NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    payment_time        TIMESTAMP     NOT NULL DEFAULT NOW(),
    payment_status      VARCHAR(20)   NOT NULL DEFAULT 'CREATED',
    payment_method      VARCHAR(30),
    gateway_order_id    VARCHAR(100),
    gateway_payment_id  VARCHAR(100),

    CONSTRAINT uq_payments_booking UNIQUE (booking_id),
    CONSTRAINT ck_payments_status CHECK (
        payment_status IN ('CREATED', 'SUCCESS', 'FAILED', 'REFUNDED')
    )
);

-- TRIGGERS
CREATE OR REPLACE FUNCTION fn_release_seats_on_booking_close()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_status IN ('CANCELLED', 'PAYMENT_FAILED')
       AND OLD.booking_status IS DISTINCT FROM NEW.booking_status THEN
        UPDATE booking_seats
           SET seat_status = 'CANCELLED'
         WHERE booking_id = NEW.booking_id
           AND seat_status = 'ACTIVE';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_release_seats_on_booking_close
    AFTER UPDATE OF booking_status ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION fn_release_seats_on_booking_close();

CREATE OR REPLACE FUNCTION fn_validate_seat_belongs_to_show_screen()
RETURNS TRIGGER AS $$
DECLARE
    v_show_screen_id INT;
    v_seat_screen_id INT;
BEGIN
    SELECT screen_id INTO v_show_screen_id FROM shows WHERE show_id = NEW.show_id;
    SELECT screen_id INTO v_seat_screen_id FROM seats WHERE seat_id = NEW.seat_id;

    IF v_show_screen_id IS NULL OR v_seat_screen_id IS NULL THEN
        RAISE EXCEPTION 'Invalid show_id (%) or seat_id (%) reference', NEW.show_id, NEW.seat_id;
    END IF;

    IF v_show_screen_id <> v_seat_screen_id THEN
        RAISE EXCEPTION
            'Seat % belongs to screen %, but show % runs on screen % — cannot book',
            NEW.seat_id, v_seat_screen_id, NEW.show_id, v_show_screen_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_seat_show_screen
    BEFORE INSERT ON booking_seats
    FOR EACH ROW
    EXECUTE FUNCTION fn_validate_seat_belongs_to_show_screen();
    