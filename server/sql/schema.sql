-- GO-GO International School: SQL Server setup script
-- Creates the login, database, schema, and seed data.
-- Run with: sqlcmd -S localhost -E -C -i schema.sql
-- Replace CHANGE_ME_PASSWORD with a strong password, then put the same
-- value in your .env file as DB_PASSWORD (quote it if it contains # or ").

IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'gogo_app')
BEGIN
    CREATE LOGIN gogo_app WITH PASSWORD = 'CHANGE_ME_PASSWORD', CHECK_POLICY = ON;
END
GO

IF DB_ID('GoGoSchoolDB') IS NULL
BEGIN
    CREATE DATABASE GoGoSchoolDB;
END
GO

USE GoGoSchoolDB;
GO

IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'gogo_app')
BEGIN
    CREATE USER gogo_app FOR LOGIN gogo_app;
    ALTER ROLE db_owner ADD MEMBER gogo_app;
END
GO

IF OBJECT_ID('dbo.users') IS NULL
CREATE TABLE dbo.users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(100) NOT NULL,
  email NVARCHAR(150) NOT NULL UNIQUE,
  password NVARCHAR(200) NOT NULL,
  role NVARCHAR(20) NOT NULL
);
GO

IF OBJECT_ID('dbo.teachers') IS NULL
CREATE TABLE dbo.teachers (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(100) NOT NULL,
  subject NVARCHAR(100) NULL,
  email NVARCHAR(150) NULL,
  phone NVARCHAR(30) NULL
);
GO

IF OBJECT_ID('dbo.classes') IS NULL
CREATE TABLE dbo.classes (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(100) NOT NULL,
  ageGroup NVARCHAR(50) NULL,
  teacherId INT NULL FOREIGN KEY REFERENCES dbo.teachers(id) ON DELETE SET NULL,
  capacity INT NULL
);
GO

IF OBJECT_ID('dbo.students') IS NULL
CREATE TABLE dbo.students (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(100) NOT NULL,
  age INT NULL,
  classId INT NULL FOREIGN KEY REFERENCES dbo.classes(id) ON DELETE SET NULL,
  parentName NVARCHAR(100) NULL,
  parentPhone NVARCHAR(30) NULL,
  parentEmail NVARCHAR(150) NULL,
  enrolledDate DATE NULL
);
GO

IF OBJECT_ID('dbo.attendance') IS NULL
CREATE TABLE dbo.attendance (
  id INT IDENTITY(1,1) PRIMARY KEY,
  studentId INT NOT NULL FOREIGN KEY REFERENCES dbo.students(id) ON DELETE CASCADE,
  [date] DATE NOT NULL,
  status NVARCHAR(20) NOT NULL
);
GO

IF OBJECT_ID('dbo.fees') IS NULL
CREATE TABLE dbo.fees (
  id INT IDENTITY(1,1) PRIMARY KEY,
  studentId INT NOT NULL FOREIGN KEY REFERENCES dbo.students(id) ON DELETE CASCADE,
  term NVARCHAR(50) NULL,
  amount DECIMAL(10,2) NULL,
  status NVARCHAR(20) NULL,
  dueDate DATE NULL
);
GO

IF OBJECT_ID('dbo.announcements') IS NULL
CREATE TABLE dbo.announcements (
  id INT IDENTITY(1,1) PRIMARY KEY,
  title NVARCHAR(200) NOT NULL,
  body NVARCHAR(MAX) NULL,
  [date] DATE NULL
);
GO

IF OBJECT_ID('dbo.inquiries') IS NULL
CREATE TABLE dbo.inquiries (
  id INT IDENTITY(1,1) PRIMARY KEY,
  parentName NVARCHAR(100) NOT NULL,
  email NVARCHAR(150) NOT NULL,
  phone NVARCHAR(30) NULL,
  childAge NVARCHAR(20) NULL,
  message NVARCHAR(MAX) NULL,
  submittedAt DATETIME2 NULL,
  status NVARCHAR(20) NULL
);
GO

-- Seed data (only if tables are empty)
IF NOT EXISTS (SELECT 1 FROM dbo.users)
INSERT INTO dbo.users (name, email, password, role) VALUES
('School Administrator', 'admin@gogo.edu', '$2a$08$E6.LFBZGfDEjrFqOBhZi3u7crUj9SuDfUwRmxsqafbX8BKOp7K4A.', 'admin'),
('Ms. Hana Reyes', 'teacher@gogo.edu', '$2a$08$vgRhb6H2e/2lo9JP6WiMEOgU3j/wsT1Ih7PI8GzY156kTjqkrhOhS', 'teacher');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.teachers)
INSERT INTO dbo.teachers (name, subject, email, phone) VALUES
('Ms. Hana Reyes', 'Early Learning', 'teacher@gogo.edu', '555-0101'),
('Mr. Daniel Cruz', 'Phonics & Reading', 'daniel.cruz@gogo.edu', '555-0102'),
('Ms. Priya Nair', 'Creative Arts', 'priya.nair@gogo.edu', '555-0103');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.classes)
INSERT INTO dbo.classes (name, ageGroup, teacherId, capacity) VALUES
('Sunflower Room', '2-3 years', 1, 15),
('Rainbow Room', '4-5 years', 2, 18),
('Star Room', '5-6 years', 3, 20);
GO

IF NOT EXISTS (SELECT 1 FROM dbo.students)
INSERT INTO dbo.students (name, age, classId, parentName, parentPhone, parentEmail, enrolledDate) VALUES
('Liam Santos', 5, 2, 'Maria Santos', '555-1001', 'maria.santos@example.com', '2025-06-01'),
('Ava Bautista', 3, 1, 'Jose Bautista', '555-1002', 'jose.bautista@example.com', '2025-06-03'),
('Noah Dela Cruz', 6, 3, 'Grace Dela Cruz', '555-1003', 'grace.delacruz@example.com', '2025-06-05'),
('Mia Torres', 4, 2, 'Paolo Torres', '555-1004', 'paolo.torres@example.com', '2025-06-10');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.attendance)
INSERT INTO dbo.attendance (studentId, [date], status) VALUES
(1, '2026-08-26', 'present'),
(2, '2026-08-26', 'absent'),
(3, '2026-08-26', 'present'),
(4, '2026-08-26', 'late');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.fees)
INSERT INTO dbo.fees (studentId, term, amount, status, dueDate) VALUES
(1, 'Term 1 - 2026', 500, 'paid', '2026-08-01'),
(2, 'Term 1 - 2026', 450, 'unpaid', '2026-08-01'),
(3, 'Term 1 - 2026', 550, 'paid', '2026-08-01'),
(4, 'Term 1 - 2026', 500, 'unpaid', '2026-08-01');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.announcements)
INSERT INTO dbo.announcements (title, body, [date]) VALUES
('Welcome Back to Term 1!', 'We''re excited to welcome all our little learners back for a brand new term full of fun and discovery.', '2026-08-20'),
('Fun Day this Friday', 'Join us for outdoor games, face painting, and a picnic lunch this Friday afternoon.', '2026-08-24');
GO
