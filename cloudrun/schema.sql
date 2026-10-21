CREATE TABLE IF NOT EXISTS travel_trip_days (
  trip_id VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  day_id VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  PRIMARY KEY (trip_id, day_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO travel_trip_days (trip_id, day_id) VALUES
  ('dalian-20261001', '10-01'),
  ('dalian-20261001', '10-02'),
  ('dalian-20261001', '10-03'),
  ('dalian-20261001', '10-04'),
  ('dalian-20261001', '10-05'),
  ('dalian-20261001', '10-06');

CREATE TABLE IF NOT EXISTS travel_profiles (
  user_id CHAR(64) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  nick_name VARCHAR(96) NOT NULL,
  avatar_id CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  avatar MEDIUMBLOB NOT NULL,
  updated_at BIGINT UNSIGNED NOT NULL,
  INDEX profile_avatar (avatar_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS travel_members (
  id CHAR(64) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  trip_id VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  user_id CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  joined_at BIGINT UNSIGNED NOT NULL,
  UNIQUE KEY member_trip_user (trip_id, user_id),
  INDEX member_recent (trip_id, joined_at, id),
  FOREIGN KEY (user_id) REFERENCES travel_profiles(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS travel_comments (
  id CHAR(32) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  trip_id VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  day_id VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  user_id CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  content TEXT NOT NULL,
  created_at BIGINT UNSIGNED NOT NULL,
  INDEX comment_day_page (trip_id, day_id, created_at, id),
  FOREIGN KEY (user_id) REFERENCES travel_profiles(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
