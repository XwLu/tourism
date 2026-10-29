CREATE TABLE IF NOT EXISTS travel_trip_days (
  trip_id VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  day_id VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  PRIMARY KEY (trip_id, day_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS travel_trips (
  trip_id VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  content JSON NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  published TINYINT(1) NOT NULL DEFAULT 1,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS climbing_guidebooks (
  guide_id VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  location VARCHAR(200) NOT NULL,
  description VARCHAR(500) NOT NULL,
  version CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  page_count INT UNSIGNED NOT NULL,
  published TINYINT(1) NOT NULL DEFAULT 1,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS climbing_guidebook_pages (
  guide_id VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  page_number INT UNSIGNED NOT NULL,
  image MEDIUMBLOB NOT NULL,
  PRIMARY KEY (guide_id, page_number),
  FOREIGN KEY (guide_id) REFERENCES climbing_guidebooks(guide_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS climbing_guidebook_sections (
  guide_id VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  section_order INT UNSIGNED NOT NULL,
  section_id VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  title VARCHAR(100) NOT NULL,
  start_page INT UNSIGNED NOT NULL,
  end_page INT UNSIGNED NOT NULL,
  PRIMARY KEY (guide_id, section_order),
  UNIQUE KEY guide_section_id (guide_id, section_id),
  FOREIGN KEY (guide_id) REFERENCES climbing_guidebooks(guide_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS climbing_guidebook_section_intros (
  guide_id VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  section_id VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  intro JSON NOT NULL,
  PRIMARY KEY (guide_id, section_id),
  FOREIGN KEY (guide_id) REFERENCES climbing_guidebooks(guide_id)
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
