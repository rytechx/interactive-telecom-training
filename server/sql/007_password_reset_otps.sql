CREATE TABLE IF NOT EXISTS password_reset_otps (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  otp_hash CHAR(64) NOT NULL,
  attempts_remaining TINYINT UNSIGNED NOT NULL DEFAULT 3,
  expires_at DATETIME NOT NULL,
  verified_at DATETIME NULL,
  reset_token_hash CHAR(64) NULL,
  reset_token_expires_at DATETIME NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT uq_password_reset_otps_reset_token UNIQUE (reset_token_hash),
  INDEX idx_password_reset_otps_user (user_id),
  INDEX idx_password_reset_otps_expiry (expires_at),
  INDEX idx_password_reset_otps_reset_expiry (reset_token_expires_at),
  CONSTRAINT fk_password_reset_otps_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;
