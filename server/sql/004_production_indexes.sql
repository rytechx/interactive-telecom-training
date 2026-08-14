SET @index_exists = (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'training_attempts'
    AND index_name = 'idx_training_attempts_status_completed'
);
SET @migration_sql = IF(
  @index_exists = 0,
  'ALTER TABLE training_attempts ADD INDEX idx_training_attempts_status_completed (status, completed_at)',
  'SELECT 1'
);
PREPARE telesim_migration_statement FROM @migration_sql;
EXECUTE telesim_migration_statement;
DEALLOCATE PREPARE telesim_migration_statement;
