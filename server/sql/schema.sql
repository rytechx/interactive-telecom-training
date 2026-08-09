CREATE DATABASE IF NOT EXISTS telesim3d
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE telesim3d;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  student_number VARCHAR(32) NOT NULL,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'instructor', 'admin') NOT NULL DEFAULT 'student',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT uq_users_student_number UNIQUE (student_number),
  CONSTRAINT uq_users_email UNIQUE (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS training_modules (
  id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  module_key VARCHAR(32) NOT NULL,
  name VARCHAR(160) NOT NULL,
  category VARCHAR(80) NOT NULL,
  difficulty VARCHAR(40) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT uq_training_modules_key UNIQUE (module_key)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS training_attempts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  module_id SMALLINT UNSIGNED NOT NULL,
  attempt_number INT UNSIGNED NOT NULL,
  status ENUM('in_progress', 'completed', 'abandoned') NOT NULL DEFAULT 'in_progress',
  score DECIMAL(5, 2) NULL,
  performance_rating VARCHAR(80) NULL,
  procedure_accuracy DECIMAL(5, 2) NULL,
  duration_seconds INT UNSIGNED NULL,
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  metrics_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_training_attempts_user (user_id),
  INDEX idx_training_attempts_module (module_id),
  INDEX idx_training_attempts_user_module (user_id, module_id),
  INDEX idx_training_attempts_completed_at (completed_at),
  CONSTRAINT uq_training_attempt_number UNIQUE (user_id, module_id, attempt_number),
  CONSTRAINT fk_training_attempts_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_training_attempts_module
    FOREIGN KEY (module_id) REFERENCES training_modules (id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS network_scenario_results (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  attempt_id BIGINT UNSIGNED NOT NULL,
  scenario_key VARCHAR(64) NOT NULL,
  scenario_title VARCHAR(180) NOT NULL,
  score DECIMAL(5, 2) NOT NULL,
  performance_rating VARCHAR(80) NOT NULL,
  duration_seconds INT UNSIGNED NOT NULL DEFAULT 0,
  diagnosis_attempts SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  incorrect_diagnosis_attempts SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  repair_attempts SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  failed_repair_attempts SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  hints_used SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  diagnostic_commands_json JSON NULL,
  metrics_json JSON NULL,
  completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_network_scenario_results_attempt (attempt_id),
  CONSTRAINT uq_network_scenario_result_attempt UNIQUE (attempt_id, scenario_key),
  CONSTRAINT fk_network_scenario_results_attempt
    FOREIGN KEY (attempt_id) REFERENCES training_attempts (id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO training_modules (module_key, name, category, difficulty)
VALUES
  ('rj45', 'RJ45 Cable Termination', 'Copper Cabling', 'Beginner'),
  ('fiber', 'Fiber Optic Fusion Splicing', 'Fiber Optics', 'Intermediate'),
  ('network', 'Network Device Installation & Troubleshooting', 'Networking & Troubleshooting', 'Intermediate / Advanced')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  category = VALUES(category),
  difficulty = VALUES(difficulty),
  is_active = TRUE;
