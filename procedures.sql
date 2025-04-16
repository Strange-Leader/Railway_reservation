-- Function to get booking details
DELIMITER //

CREATE FUNCTION get_booking_details(p_pnr VARCHAR(15)) 
RETURNS JSON
DETERMINISTIC
BEGIN
    DECLARE result JSON;
    
    -- Get ticket and passenger details
    SELECT JSON_OBJECT(
        'pnr', t.pnr_number,
        'trainName', tr.train_name,
        'trainNumber', t.train_number,
        'classType', t.class_type,
        'journeyDate', t.journey_date,
        'sourceStation', t.source_station,
        'destinationStation', t.destination_station,
        'departureTime', rs1.departure_time,
        'arrivalTime', rs2.arrival_time,
        'totalFare', t.total_fare,
        'passengers', (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'name', p.name,
                    'age', TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()),
                    'gender', p.gender,
                    'seatNumber', pt.seat_number,
                    'coachNumber', pt.coach_number,
                    'status', pt.reservation_status
                )
            )
            FROM PASSENGER p
            JOIN PASSENGER_TICKET pt ON p.passenger_id = pt.passenger_id
            WHERE pt.pnr_number = t.pnr_number
        ),
        'payment', (
            SELECT JSON_OBJECT(
                'paymentMode', payment_mode,
                'transactionId', transaction_id,
                'paymentStatus', payment_status
            )
            FROM PAYMENT
            WHERE pnr_number = t.pnr_number
            LIMIT 1
        )
    ) INTO result
    FROM TICKET t
    JOIN TRAIN tr ON t.train_number = tr.train_number
    JOIN ROUTE r ON t.train_number = r.train_number
    JOIN ROUTE_STATION rs1 ON r.route_id = rs1.route_id AND t.source_station = rs1.station_code
    JOIN ROUTE_STATION rs2 ON r.route_id = rs2.route_id AND t.destination_station = rs2.station_code
    WHERE t.pnr_number = p_pnr;
    
    RETURN result;
END //

DELIMITER ;

-- Function to get train details
DELIMITER //

CREATE FUNCTION get_train_details(p_train_number VARCHAR(10)) 
RETURNS JSON
DETERMINISTIC
BEGIN
    DECLARE result JSON;
    
    -- Get train details and schedule
    SELECT JSON_OBJECT(
        'trainNumber', t.train_number,
        'trainName', t.train_name,
        'trainType', t.train_type,
        'totalCoaches', t.total_coaches,
        'runningDays', JSON_OBJECT(
            'sunday', t.runs_on_sunday,
            'monday', t.runs_on_monday,
            'tuesday', t.runs_on_tuesday,
            'wednesday', t.runs_on_wednesday,
            'thursday', t.runs_on_thursday,
            'friday', t.runs_on_friday,
            'saturday', t.runs_on_saturday
        ),
        'route', (
            SELECT JSON_OBJECT(
                'source', r.source_station,
                'destination', r.destination_station,
                'totalDistance', r.total_distance,
                'totalStops', r.total_stops
            )
            FROM ROUTE r
            WHERE r.train_number = t.train_number
        ),
        'schedule', (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'stationCode', rs.station_code,
                    'stationName', s.station_name,
                    'city', s.city,
                    'state', s.state,
                    'arrivalTime', rs.arrival_time,
                    'departureTime', rs.departure_time,
                    'distanceFromSource', rs.distance_from_source,
                    'platformNumber', rs.platform_number,
                    'haltTime', rs.halt_time
                )
            )
            FROM ROUTE_STATION rs
            JOIN STATION s ON rs.station_code = s.station_code
            WHERE rs.route_id = (
                SELECT route_id FROM ROUTE WHERE train_number = t.train_number
            )
            ORDER BY rs.stop_number
        ),
        'classes', (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'classType', tc.class_type,
                    'totalSeats', tc.total_seats,
                    'basicFare', tc.basic_fare
                )
            )
            FROM TRAIN_CLASS tc
            WHERE tc.train_number = t.train_number
        )
    ) INTO result
    FROM TRAIN t
    WHERE t.train_number = p_train_number;
    
    RETURN result;
END //

DELIMITER ;

-- Procedure to book ticket
DELIMITER //

DROP PROCEDURE IF EXISTS book_ticket;

CREATE PROCEDURE book_ticket(
    IN p_name VARCHAR(100),
    IN p_email VARCHAR(100),
    IN p_phone VARCHAR(15),
    IN p_address VARCHAR(200),
    IN p_date_of_birth DATE,
    IN p_gender VARCHAR(10),
    IN p_id_proof_type VARCHAR(20),
    IN p_id_proof_number VARCHAR(30),
    IN p_is_registered BOOLEAN,
    IN p_train_number VARCHAR(10),
    IN p_journey_date DATE,
    IN p_class_type VARCHAR(20),
    IN p_payment_mode VARCHAR(30),
    IN p_num_passengers INT,
    OUT p_result JSON
)
BEGIN
    DECLARE v_passenger_id INT;
    DECLARE v_pnr VARCHAR(15);
    DECLARE v_basic_fare FLOAT;
    DECLARE v_total_fare FLOAT;
    DECLARE v_booking_channel VARCHAR(20);
    DECLARE v_source_station VARCHAR(10);
    DECLARE v_dest_station VARCHAR(10);
    DECLARE v_available_seats INT;
    DECLARE v_booking_status VARCHAR(20);
    DECLARE v_waitlist_count INT;
    DECLARE v_seat_numbers JSON DEFAULT JSON_ARRAY();
    DECLARE i INT DEFAULT 1;
    
    -- Set booking channel based on payment mode
    SET v_booking_channel = IF(p_payment_mode = 'Online', 'Online', 'Counter');
    
    -- Generate PNR
    SET v_pnr = CONCAT(
        DATE_FORMAT(NOW(), '%y%m%d'),
        LPAD(FLOOR(RAND() * 10000), 4, '0')
    );
    
    -- Get basic fare
    SELECT basic_fare INTO v_basic_fare
    FROM TRAIN_CLASS
    WHERE train_number = p_train_number AND class_type = p_class_type;
    
    -- Calculate total fare (basic fare + 5% GST + 2% service charge)
    SET v_total_fare = v_basic_fare * 1.07 * p_num_passengers;
    
    -- Get source and destination stations
    SELECT source_station, destination_station 
    INTO v_source_station, v_dest_station
    FROM ROUTE 
    WHERE train_number = p_train_number 
    LIMIT 1;
    
    -- Get current available seats and waitlist count
    SELECT available_seats, waitlist_count
    INTO v_available_seats, v_waitlist_count
    FROM TRAIN_STATUS
    WHERE train_number = p_train_number 
    AND journey_date = p_journey_date 
    AND class_type = p_class_type;
    
    -- Determine booking status and update seats
    IF v_available_seats >= p_num_passengers THEN
        -- Confirm booking
        SET v_booking_status = 'CONFIRMED';
        SET v_waitlist_count = 0;
        
        -- Generate seat numbers
        WHILE i <= p_num_passengers DO
            SET v_seat_numbers = JSON_ARRAY_APPEND(v_seat_numbers, '$', 
                CONCAT(p_class_type, '-', v_available_seats - i + 1));
            SET i = i + 1;
        END WHILE;
        
        -- Update available seats
        UPDATE TRAIN_STATUS
        SET available_seats = available_seats - p_num_passengers,
            last_updated = NOW()
        WHERE train_number = p_train_number 
        AND journey_date = p_journey_date 
        AND class_type = p_class_type;
        
    ELSE
        -- Add to waiting list
        SET v_booking_status = 'WAITLISTED';
        SET v_waitlist_count = v_waitlist_count + 1;
        
        -- Update waiting list
        UPDATE TRAIN_STATUS
        SET waitlist_count = waitlist_count + 1,
            last_updated = NOW()
        WHERE train_number = p_train_number 
        AND journey_date = p_journey_date 
        AND class_type = p_class_type;
    END IF;
    
    -- Start transaction
    START TRANSACTION;
    
    -- Insert passenger
    INSERT INTO PASSENGER (
        name, email, phone, address, date_of_birth, gender,
        id_proof_type, id_proof_number, is_registered
    ) VALUES (
        p_name, p_email, p_phone, p_address, p_date_of_birth, p_gender,
        p_id_proof_type, p_id_proof_number, p_is_registered
    );
    
    SET v_passenger_id = LAST_INSERT_ID();
    
    -- Insert ticket
    INSERT INTO TICKET (
        pnr_number, booking_date, journey_date, source_station,
        destination_station, train_number, class_type, total_passengers,
        total_fare, booking_status, booking_timestamp, booking_channel
    ) VALUES (
        v_pnr, CURDATE(), p_journey_date, v_source_station,
        v_dest_station, p_train_number, p_class_type, p_num_passengers,
        v_total_fare, v_booking_status, NOW(), v_booking_channel
    );
    
    -- Insert passenger ticket
    INSERT INTO PASSENGER_TICKET (
        pnr_number, passenger_id, seat_number, coach_number,
        reservation_status, is_primary_passenger
    ) VALUES (
        v_pnr, v_passenger_id, 
        IF(v_booking_status = 'CONFIRMED', JSON_EXTRACT(v_seat_numbers, '$[0]'), NULL),
        IF(v_booking_status = 'CONFIRMED', p_class_type, NULL),
        v_booking_status, TRUE
    );
    
    -- Insert payment
    INSERT INTO PAYMENT (
        pnr_number, amount, payment_mode, payment_timestamp,
        transaction_id, payment_status, gst_amount, service_charge
    ) VALUES (
        v_pnr, v_total_fare, p_payment_mode, NOW(),
        CONCAT('TXN', DATE_FORMAT(NOW(), '%Y%m%d%H%i%s')),
        'Success', v_basic_fare * 0.05 * p_num_passengers, 
        v_basic_fare * 0.02 * p_num_passengers
    );
    
    -- Commit transaction
    COMMIT;
    
    -- Set the result
    SET p_result = JSON_OBJECT(
        'success', TRUE,
        'pnr', v_pnr,
        'bookingStatus', v_booking_status,
        'waitingListNumber', v_waitlist_count,
        'seatNumbers', v_seat_numbers,
        'message', CONCAT('Ticket ', 
            IF(v_booking_status = 'CONFIRMED', 'booked successfully', 
            'added to waiting list')),
        'bookingDetails', (
            SELECT get_booking_details(v_pnr)
        )
    );
END //

DELIMITER ;

-- Procedure to cancel ticket
DELIMITER //

CREATE PROCEDURE cancel_ticket(
    IN p_pnr VARCHAR(15),
    IN p_cancellation_reason VARCHAR(200),
    OUT p_result JSON
)
BEGIN
    DECLARE v_train_number VARCHAR(10);
    DECLARE v_journey_date DATE;
    DECLARE v_class_type VARCHAR(20);
    DECLARE v_total_passengers INT;
    DECLARE v_total_fare FLOAT;
    DECLARE v_refund_amount FLOAT;
    DECLARE v_cancellation_charge FLOAT;
    DECLARE v_cancellation_id INT;
    
    -- Get ticket details
    SELECT train_number, journey_date, class_type, total_passengers, total_fare
    INTO v_train_number, v_journey_date, v_class_type, v_total_passengers, v_total_fare
    FROM TICKET
    WHERE pnr_number = p_pnr;
    
    -- Calculate cancellation charges based on time before journey
    -- More than 48 hours: 25% charge
    -- 24-48 hours: 50% charge
    -- Less than 24 hours: 75% charge
    SET v_cancellation_charge = 
        CASE 
            WHEN TIMESTAMPDIFF(HOUR, NOW(), v_journey_date) > 48 THEN v_total_fare * 0.25
            WHEN TIMESTAMPDIFF(HOUR, NOW(), v_journey_date) > 24 THEN v_total_fare * 0.50
            ELSE v_total_fare * 0.75
        END;
    
    SET v_refund_amount = v_total_fare - v_cancellation_charge;
    
    -- Get next cancellation_id
    SELECT COALESCE(MAX(cancellation_id), 0) + 1 INTO v_cancellation_id
    FROM CANCELLATION;
    
    -- Start transaction
    START TRANSACTION;
    
    -- Update ticket status
    UPDATE TICKET
    SET booking_status = 'CANCELLED'
    WHERE pnr_number = p_pnr;
    
    -- Update passenger ticket status
    UPDATE PASSENGER_TICKET
    SET reservation_status = 'CANCELLED'
    WHERE pnr_number = p_pnr;
    
    -- Update train status to add back available seats
    UPDATE TRAIN_STATUS
    SET available_seats = available_seats + v_total_passengers,
        last_updated = NOW()
    WHERE train_number = v_train_number
    AND journey_date = v_journey_date
    AND class_type = v_class_type;
    
    -- Insert cancellation record
    INSERT INTO CANCELLATION (
        cancellation_id,
        pnr_number, 
        cancellation_timestamp, 
        cancellation_reason,
        refund_amount, 
        refund_status, 
        cancelled_by
    ) VALUES (
        v_cancellation_id,
        p_pnr, 
        NOW(), 
        p_cancellation_reason,
        v_refund_amount, 
        'Processed', 
        'Passenger'
    );
    
    -- Update payment status
    UPDATE PAYMENT
    SET payment_status = 'Refunded'
    WHERE pnr_number = p_pnr;
    
    -- Commit transaction
    COMMIT;
    
    -- Set the result
    SET p_result = JSON_OBJECT(
        'success', TRUE,
        'pnr', p_pnr,
        'refundAmount', v_refund_amount,
        'cancellationCharge', v_cancellation_charge,
        'message', 'Ticket cancelled successfully'
    );
END //

DELIMITER ; 