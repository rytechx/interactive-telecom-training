CREATE TABLE IF NOT EXISTS classes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  instructor_id INT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  class_code VARCHAR(20) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_classes_instructor (instructor_id),
  INDEX idx_classes_active (is_active),
  CONSTRAINT uq_classes_code UNIQUE (class_code),
  CONSTRAINT fk_classes_instructor
    FOREIGN KEY (instructor_id) REFERENCES users (id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS class_enrollments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  class_id INT UNSIGNED NOT NULL,
  student_id INT UNSIGNED NOT NULL,
  enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_class_enrollments_class (class_id),
  INDEX idx_class_enrollments_student (student_id),
  CONSTRAINT uq_class_enrollments_class_student UNIQUE (class_id, student_id),
  CONSTRAINT fk_class_enrollments_class
    FOREIGN KEY (class_id) REFERENCES classes (id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_class_enrollments_student
    FOREIGN KEY (student_id) REFERENCES users (id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;
