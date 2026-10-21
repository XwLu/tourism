INSERT INTO travel_trip_days (trip_id, day_id) VALUES
  ('dalian-20261001', '10-01'),
  ('dalian-20261001', '10-02'),
  ('dalian-20261001', '10-03'),
  ('dalian-20261001', '10-04'),
  ('dalian-20261001', '10-05'),
  ('dalian-20261001', '10-06')
ON DUPLICATE KEY UPDATE day_id = VALUES(day_id);
