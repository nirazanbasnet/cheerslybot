-- Team Profiles Database Schema
-- This creates the tables for storing team member information

CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT UNIQUE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mobile TEXT,
    position TEXT,
    designation TEXT,
    joinDate TEXT,
    address TEXT,
    bloodGroup TEXT,
    dob TEXT,
    image TEXT,
    secondaryContact TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS birthday_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER NOT NULL,
    message TEXT,
    image TEXT,
    lastCelebratedDate TEXT,
    addedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profiles (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS anniversary_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER NOT NULL,
    message TEXT,
    image TEXT,
    lastCelebratedDate TEXT,
    addedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profiles (id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_userId ON profiles(userId);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_name ON profiles(name);
CREATE INDEX IF NOT EXISTS idx_birthday_configs_profile_id ON birthday_configs(profile_id);
CREATE INDEX IF NOT EXISTS idx_anniversary_configs_profile_id ON anniversary_configs(profile_id);
