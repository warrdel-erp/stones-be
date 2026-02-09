@echo off
REM Local Database Reset Script for Windows
REM This script drops the local database and recreates it with migrations and seeders
REM WARNING: This will DELETE ALL local data!
REM Usage: scripts\local\reset-db.bat

setlocal enabledelayedexpansion

echo ======================================
echo Local Database Reset
echo ======================================
echo.
echo ⚠️  WARNING: This will DROP the local database!
echo ⚠️  ALL LOCAL DATA WILL BE LOST!
echo.
set /p confirm="Are you sure you want to continue? (type 'y' to confirm): "

if /i not "%confirm%"=="y" (
    echo Database reset cancelled.
    exit /b 0
)

echo.
echo Proceeding with local database reset...
echo.

REM Database configuration
set DB_NAME=stone_erp
set DB_USER=root
set DB_PASSWORD=rootroot

echo 🗑️  Dropping existing database: %DB_NAME%...
if "%DB_PASSWORD%"=="" (
    mysql -u "%DB_USER%" -e "DROP DATABASE IF EXISTS %DB_NAME%;"
) else (
    mysql -u "%DB_USER%" -p"%DB_PASSWORD%" -e "DROP DATABASE IF EXISTS %DB_NAME%;"
)

if errorlevel 1 (
    echo ERROR: Failed to drop database. Please check your MySQL connection and credentials.
    exit /b 1
)

echo.
echo 🆕 Creating fresh database: %DB_NAME%...
if "%DB_PASSWORD%"=="" (
    mysql -u "%DB_USER%" -e "CREATE DATABASE %DB_NAME%;"
) else (
    mysql -u "%DB_USER%" -p"%DB_PASSWORD%" -e "CREATE DATABASE %DB_NAME%;"
)

if errorlevel 1 (
    echo ERROR: Failed to create database. Please check your MySQL connection and credentials.
    exit /b 1
)

echo.
echo ✅ Database recreated successfully!

echo.
echo 🗄️  Running migrations and seeders...
call npm run initialize:db

if errorlevel 1 (
    echo ERROR: Failed to run migrations/seeders.
    exit /b 1
)

echo.
echo ======================================
echo ✅ Local Database Reset Complete!
echo ======================================
echo.
echo You can now start your server with:
echo   npm run dev
echo.

endlocal
