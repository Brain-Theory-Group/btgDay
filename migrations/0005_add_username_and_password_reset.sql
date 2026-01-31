-- Add username and recovery email columns to users
ALTER TABLE users ADD COLUMN username TEXT;
ALTER TABLE users ADD COLUMN recovery_email TEXT;

-- Backfill username and recovery email with existing email values
UPDATE users SET username = email WHERE username IS NULL OR username = '';
UPDATE users SET recovery_email = email WHERE recovery_email IS NULL OR recovery_email = '';
UPDATE users SET username = 'admin' WHERE email = 'admin@example.com';

-- Ensure usernames are unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  used INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
