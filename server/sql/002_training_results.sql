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

SET @column_exists = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'training_attempts'
    AND column_name = 'attempt_number'
);
SET @migration_sql = IF(
  @column_exists = 0,
  'ALTER TABLE training_attempts ADD COLUMN attempt_number INT UNSIGNED NULL AFTER module_id',
  'SELECT 1'
);
PREPARE telesim_migration_statement FROM @migration_sql;
EXECUTE telesim_migration_statement;
DEALLOCATE PREPARE telesim_migration_statement;

SET @column_exists = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'training_attempts'
    AND column_name = 'procedure_accuracy'
);
SET @migration_sql = IF(
  @column_exists = 0,
  'ALTER TABLE training_attempts ADD COLUMN procedure_accuracy DECIMAL(5, 2) NULL AFTER performance_rating',
  'SELECT 1'
);
PREPARE telesim_migration_statement FROM @migration_sql;
EXECUTE telesim_migration_statement;
DEALLOCATE PREPARE telesim_migration_statement;

SET @column_exists = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'training_attempts'
    AND column_name = 'duration_seconds'
);
SET @migration_sql = IF(
  @column_exists = 0,
  'ALTER TABLE training_attempts ADD COLUMN duration_seconds INT UNSIGNED NULL AFTER procedure_accuracy',
  'SELECT 1'
);
PREPARE telesim_migration_statement FROM @migration_sql;
EXECUTE telesim_migration_statement;
DEALLOCATE PREPARE telesim_migration_statement;

SET @column_exists = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'training_attempts'
    AND column_name = 'metrics_json'
);
SET @migration_sql = IF(
  @column_exists = 0,
  'ALTER TABLE training_attempts ADD COLUMN metrics_json JSON NULL AFTER completed_at',
  'SELECT 1'
);
PREPARE telesim_migration_statement FROM @migration_sql;
EXECUTE telesim_migration_statement;
DEALLOCATE PREPARE telesim_migration_statement;

SET @column_exists = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'training_attempts'
    AND column_name = 'created_at'
);
SET @migration_sql = IF(
  @column_exists = 0,
  'ALTER TABLE training_attempts ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER metrics_json',
  'SELECT 1'
);
PREPARE telesim_migration_statement FROM @migration_sql;
EXECUTE telesim_migration_statement;
DEALLOCATE PREPARE telesim_migration_statement;

SET @column_exists = (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'training_attempts'
    AND column_name = 'updated_at'
);
SET @migration_sql = IF(
  @column_exists = 0,
  'ALTER TABLE training_attempts ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at',
  'SELECT 1'
);
PREPARE telesim_migration_statement FROM @migration_sql;
EXECUTE telesim_migration_statement;
DEALLOCATE PREPARE telesim_migration_statement;

CREATE TEMPORARY TABLE IF NOT EXISTS telesim_attempt_numbers (
  id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  attempt_number INT UNSIGNED NOT NULL
);
TRUNCATE TABLE telesim_attempt_numbers;
INSERT INTO telesim_attempt_numbers (id, attempt_number)
SELECT id,
       ROW_NUMBER() OVER (
         PARTITION BY user_id, module_id
         ORDER BY started_at, id
       ) AS attempt_number
FROM training_attempts;
UPDATE training_attempts attempt
INNER JOIN telesim_attempt_numbers numbered ON numbered.id = attempt.id
SET attempt.attempt_number = numbered.attempt_number
WHERE attempt.attempt_number IS NULL OR attempt.attempt_number = 0;
DROP TEMPORARY TABLE telesim_attempt_numbers;
ALTER TABLE training_attempts
  MODIFY COLUMN attempt_number INT UNSIGNED NOT NULL;

SET @index_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'training_attempts'
    AND index_name = 'idx_training_attempts_user_module'
);
SET @migration_sql = IF(
  @index_exists = 0,
  'ALTER TABLE training_attempts ADD INDEX idx_training_attempts_user_module (user_id, module_id)',
  'SELECT 1'
);
PREPARE telesim_migration_statement FROM @migration_sql;
EXECUTE telesim_migration_statement;
DEALLOCATE PREPARE telesim_migration_statement;

SET @index_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'training_attempts'
    AND index_name = 'idx_training_attempts_completed_at'
);
SET @migration_sql = IF(
  @index_exists = 0,
  'ALTER TABLE training_attempts ADD INDEX idx_training_attempts_completed_at (completed_at)',
  'SELECT 1'
);
PREPARE telesim_migration_statement FROM @migration_sql;
EXECUTE telesim_migration_statement;
DEALLOCATE PREPARE telesim_migration_statement;

SET @index_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'training_attempts'
    AND index_name = 'uq_training_attempt_number'
);
SET @migration_sql = IF(
  @index_exists = 0,
  'ALTER TABLE training_attempts ADD CONSTRAINT uq_training_attempt_number UNIQUE (user_id, module_id, attempt_number)',
  'SELECT 1'
);
PREPARE telesim_migration_statement FROM @migration_sql;
EXECUTE telesim_migration_statement;
DEALLOCATE PREPARE telesim_migration_statement;

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
