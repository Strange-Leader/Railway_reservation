DROP FUNCTION IF EXISTS search_trains;

DELIMITER //

CREATE FUNCTION search_trains(
    p_source_station VARCHAR(10),
    p_destination_station VARCHAR(10),
    p_journey_date DATE,
    p_class_type VARCHAR(20)
) RETURNS JSON
DETERMINISTIC
BEGIN
    DECLARE day_of_week INT;
    
    -- Get day of week (0 = Sunday, 1 = Monday, etc.)
    SET day_of_week = DAYOFWEEK(p_journey_date) - 1;
    
    RETURN (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'train_number', t.train_number,
                'train_name', t.train_name,
                'train_type', t.train_type,
                'source_departure', rs1.departure_time,
                'dest_arrival', rs2.arrival_time,
                'total_distance', r.total_distance,
                'total_stops', r.total_stops,
                'class_info', (
                    SELECT GROUP_CONCAT(
                        CONCAT(
                            tc.class_type, '|',
                            tc.basic_fare, '|',
                            COALESCE(ts.available_seats, tc.total_seats), '|',
                            COALESCE(ts.rac_seats, 0), '|',
                            COALESCE(ts.waitlist_count, 0)
                        )
                    )
                    FROM TRAIN_CLASS tc
                    LEFT JOIN TRAIN_STATUS ts ON tc.train_number = ts.train_number 
                        AND ts.journey_date = p_journey_date 
                        AND tc.class_type = ts.class_type
                    WHERE tc.train_number = t.train_number
                )
            )
        )
        FROM TRAIN t
        JOIN ROUTE r ON t.train_number = r.train_number
        JOIN ROUTE_STATION rs1 ON r.route_id = rs1.route_id
        JOIN ROUTE_STATION rs2 ON r.route_id = rs2.route_id
        WHERE rs1.station_code = p_source_station 
        AND rs2.station_code = p_destination_station
        AND rs1.stop_number < rs2.stop_number
        AND (
            (day_of_week = 0 AND t.runs_on_sunday = TRUE) OR
            (day_of_week = 1 AND t.runs_on_monday = TRUE) OR
            (day_of_week = 2 AND t.runs_on_tuesday = TRUE) OR
            (day_of_week = 3 AND t.runs_on_wednesday = TRUE) OR
            (day_of_week = 4 AND t.runs_on_thursday = TRUE) OR
            (day_of_week = 5 AND t.runs_on_friday = TRUE) OR
            (day_of_week = 6 AND t.runs_on_saturday = TRUE)
        )
        GROUP BY t.train_number, t.train_name, t.train_type, rs1.departure_time, rs2.arrival_time, r.total_distance, r.total_stops
        ORDER BY rs1.departure_time
    );
END //

DELIMITER ;