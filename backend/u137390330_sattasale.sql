-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jul 24, 2026 at 03:05 AM
-- Server version: 11.8.8-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u137390330_sattasale`
--

-- --------------------------------------------------------

--
-- Table structure for table `bids`
--

CREATE TABLE `bids` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `game_id` int(10) UNSIGNED NOT NULL,
  `game_type` varchar(50) NOT NULL,
  `session` enum('open','close') NOT NULL,
  `number` varchar(20) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `potential_winning` decimal(12,2) DEFAULT 0.00,
  `win_amount` decimal(12,2) DEFAULT 0.00,
  `wallet_deducted` decimal(10,2) DEFAULT 0.00,
  `winning_deducted` decimal(10,2) DEFAULT 0.00,
  `status` enum('pending','won','lost','cancelled') DEFAULT 'pending',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `bids`
--

INSERT INTO `bids` (`id`, `user_id`, `game_id`, `game_type`, `session`, `number`, `amount`, `potential_winning`, `win_amount`, `wallet_deducted`, `winning_deducted`, `status`, `created_at`) VALUES
(1, 2, 6, 'single_digit', 'open', '2', 500.00, 4500.00, 0.00, 500.00, 0.00, 'pending', '2026-04-30 07:33:28'),
(2, 2, 6, 'jodi_bulk', 'open', '18', 200.00, 18000.00, 0.00, 200.00, 0.00, 'pending', '2026-04-30 22:22:35'),
(3, 2, 12, 'single_digit', 'open', '2', 200.00, 1800.00, 0.00, 200.00, 0.00, 'pending', '2026-05-01 00:30:31'),
(4, 2, 12, 'single_digit', 'open', '0', 10.00, 90.00, 0.00, 10.00, 0.00, 'pending', '2026-05-01 22:12:41'),
(5, 2, 12, 'single_digit_bulk', 'open', '7', 200.00, 1800.00, 0.00, 200.00, 0.00, 'pending', '2026-05-02 06:35:43'),
(6, 2, 8, 'half_sangam_b', 'open', '579-7', 200.00, 300000.00, 0.00, 200.00, 0.00, 'pending', '2026-05-02 06:36:15'),
(7, 2, 12, 'single_digit', 'open', '0', 10.00, 90.00, 0.00, 10.00, 0.00, 'pending', '2026-05-02 22:51:52'),
(8, 2, 12, 'single_digit', 'open', '0', 50.00, 450.00, 0.00, 50.00, 0.00, 'pending', '2026-05-02 22:52:22'),
(9, 2, 12, 'single_digit_bulk', 'open', '0', 10.00, 90.00, 0.00, 10.00, 0.00, 'pending', '2026-05-02 22:53:50'),
(10, 2, 12, 'single_digit_bulk', 'open', '1', 10.00, 90.00, 0.00, 10.00, 0.00, 'pending', '2026-05-02 22:53:51'),
(11, 2, 12, 'single_digit_bulk', 'open', '2', 50.00, 450.00, 0.00, 50.00, 0.00, 'pending', '2026-05-02 22:53:53'),
(12, 2, 12, 'single_digit_bulk', 'open', '9', 100.00, 900.00, 0.00, 100.00, 0.00, 'pending', '2026-05-02 22:53:54'),
(13, 2, 12, 'jodi_digit', 'open', '00', 10.00, 900.00, 0.00, 10.00, 0.00, 'pending', '2026-05-02 22:54:31'),
(14, 2, 12, 'single_pana', 'open', '128', 10.00, 1500.00, 0.00, 10.00, 0.00, 'pending', '2026-05-02 22:55:53'),
(15, 2, 12, 'triple_pana', 'open', '000', 10.00, 6000.00, 0.00, 10.00, 0.00, 'pending', '2026-05-02 22:57:20'),
(16, 2, 12, 'half_sangam_a', 'open', '0-128', 10.00, 15000.00, 0.00, 10.00, 0.00, 'pending', '2026-05-02 22:59:16'),
(17, 2, 8, 'half_sangam_b', 'open', '128-0', 50.00, 75000.00, 0.00, 50.00, 0.00, 'pending', '2026-05-02 23:00:03'),
(18, 2, 12, 'single_digit', 'open', '7', 200.00, 1800.00, 0.00, 200.00, 0.00, 'pending', '2026-05-03 17:03:43'),
(19, 2, 12, 'single_digit_bulk', 'close', '7', 500.00, 4500.00, 0.00, 500.00, 0.00, 'pending', '2026-05-03 17:27:39'),
(20, 2, 12, 'single_digit_bulk', 'close', '3', 200.00, 1800.00, 0.00, 200.00, 0.00, 'pending', '2026-05-03 17:27:39'),
(21, 3, 12, 'single_digit', 'open', '0', 500.00, 4500.00, 0.00, 500.00, 0.00, 'pending', '2026-05-04 08:51:07'),
(22, 3, 12, 'single_digit_bulk', 'open', '3', 20.00, 180.00, 0.00, 20.00, 0.00, 'pending', '2026-05-04 08:54:44'),
(23, 3, 12, 'single_digit_bulk', 'open', '9', 100.00, 900.00, 0.00, 100.00, 0.00, 'pending', '2026-05-04 08:54:45'),
(24, 3, 12, 'single_digit_bulk', 'open', '7', 20.00, 180.00, 0.00, 20.00, 0.00, 'pending', '2026-05-04 08:54:46'),
(25, 3, 12, 'half_sangam_a', 'open', '0-128', 10.00, 15000.00, 0.00, 10.00, 0.00, 'pending', '2026-05-04 09:01:16'),
(26, 3, 12, 'half_sangam_b', 'open', '128-0', 10.00, 15000.00, 0.00, 10.00, 0.00, 'pending', '2026-05-04 09:01:35'),
(27, 3, 12, 'two_digit_pana', 'open', '00|128', 10.00, 3000.00, 0.00, 10.00, 0.00, 'pending', '2026-05-04 09:15:08'),
(28, 2, 12, 'single_digit', 'open', '2', 500.00, 4500.00, 0.00, 500.00, 0.00, 'pending', '2026-05-08 07:51:59'),
(29, 3, 6, 'sp_dp_tp', 'open', '128', 10.00, 1500.00, 0.00, 10.00, 0.00, 'pending', '2026-05-23 06:58:56'),
(30, 3, 8, 'sp_dp_tp', 'open', '128', 10.00, 1500.00, 0.00, 10.00, 0.00, 'pending', '2026-05-24 21:21:37'),
(31, 2, 12, 'dp_common', 'open', '112', 500.00, 150000.00, 0.00, 500.00, 0.00, 'pending', '2026-05-31 16:35:17'),
(32, 2, 11, 'single_digit', 'open', '1', 50.00, 450.00, 0.00, 50.00, 0.00, 'pending', '2026-06-04 17:02:55'),
(33, 2, 11, 'sp_common', 'open', '345', 200.00, 30000.00, 0.00, 200.00, 0.00, 'pending', '2026-06-04 17:28:52'),
(34, 2, 11, 'sp_common', 'open', '246', 100.00, 15000.00, 0.00, 100.00, 0.00, 'pending', '2026-06-04 17:30:57'),
(35, 3, 8, 'dp_motor', 'open', '200', 100.00, 30000.00, 0.00, 100.00, 0.00, 'pending', '2026-06-11 20:30:46'),
(36, 2, 12, 'jodi_digit', 'open', '18', 10.00, 900.00, 0.00, 10.00, 0.00, 'pending', '2026-07-18 13:24:24'),
(37, 2, 12, 'jodi_digit', 'open', '23', 10.00, 900.00, 0.00, 10.00, 0.00, 'pending', '2026-07-18 13:25:32'),
(38, 2, 12, 'jodi_digit', 'open', '22', 50.00, 4500.00, 0.00, 50.00, 0.00, 'pending', '2026-07-18 13:27:46'),
(39, 2, 12, 'jodi_digit', 'open', '11', 10.00, 900.00, 0.00, 10.00, 0.00, 'pending', '2026-07-21 13:00:33');

-- --------------------------------------------------------

--
-- Table structure for table `deposit_requests`
--

CREATE TABLE `deposit_requests` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `type` enum('deposit','withdrawal') DEFAULT 'deposit',
  `amount` decimal(10,2) NOT NULL,
  `payment_proof` varchar(255) DEFAULT NULL,
  `utr_number` varchar(50) DEFAULT NULL,
  `upi_id` varchar(100) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `ifsc_code` varchar(20) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `admin_note` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `deposit_requests`
--

INSERT INTO `deposit_requests` (`id`, `user_id`, `type`, `amount`, `payment_proof`, `utr_number`, `upi_id`, `bank_name`, `account_number`, `ifsc_code`, `status`, `admin_note`, `created_at`, `updated_at`) VALUES
(1, 2, 'deposit', 1000.00, NULL, NULL, NULL, NULL, NULL, NULL, 'approved', NULL, '2026-04-30 02:04:06', '2026-04-30 02:21:03'),
(2, 2, 'deposit', 5000.00, NULL, NULL, NULL, NULL, NULL, NULL, 'approved', NULL, '2026-05-01 16:37:58', '2026-05-21 12:36:31'),
(3, 2, 'deposit', 2000.00, NULL, NULL, NULL, NULL, NULL, NULL, 'approved', NULL, '2026-05-08 02:22:34', '2026-05-21 12:36:30'),
(4, 18, 'deposit', 100.00, NULL, NULL, NULL, NULL, NULL, NULL, 'approved', NULL, '2026-05-12 07:08:35', '2026-05-21 12:36:28'),
(5, 2, 'deposit', 5000.00, NULL, NULL, NULL, NULL, NULL, NULL, 'approved', NULL, '2026-05-24 12:30:14', '2026-05-24 12:31:06'),
(6, 2, 'deposit', 1000.00, NULL, NULL, NULL, NULL, NULL, NULL, 'approved', NULL, '2026-05-24 12:32:02', '2026-07-02 11:03:18');

-- --------------------------------------------------------

--
-- Table structure for table `games`
--

CREATE TABLE `games` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `game_category` enum('main','starline','disawar') DEFAULT 'main',
  `open_time` time NOT NULL,
  `close_time` time NOT NULL,
  `result_time` time NOT NULL,
  `status` enum('open','closed','deleted') DEFAULT 'closed',
  `open_result` varchar(10) DEFAULT NULL,
  `close_result` varchar(10) DEFAULT NULL,
  `jodi_result` varchar(5) DEFAULT NULL,
  `min_bid` decimal(10,2) DEFAULT 10.00,
  `max_bid` decimal(10,2) DEFAULT 10000.00,
  `result_declared_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_hidden` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `games`
--

INSERT INTO `games` (`id`, `name`, `game_category`, `open_time`, `close_time`, `result_time`, `status`, `open_result`, `close_result`, `jodi_result`, `min_bid`, `max_bid`, `result_declared_at`, `created_at`, `updated_at`, `is_hidden`) VALUES
(1, 'Kalyan', 'main', '15:30:00', '17:30:00', '17:45:00', 'open', NULL, NULL, NULL, 10.00, 10000.00, NULL, '2026-04-29 16:53:25', '2026-04-29 16:53:25', 0),
(2, 'Milan Day', 'main', '13:00:00', '14:30:00', '14:45:00', 'open', NULL, NULL, NULL, 10.00, 10000.00, NULL, '2026-04-29 16:53:25', '2026-04-29 16:53:25', 0),
(3, 'Rajdhani Day', 'main', '15:30:00', '17:30:00', '17:45:00', 'closed', NULL, NULL, NULL, 10.00, 5000.00, NULL, '2026-04-29 16:53:25', '2026-04-29 16:53:25', 0),
(4, 'Main Bazar', 'main', '21:00:00', '23:00:00', '23:30:00', 'open', NULL, NULL, NULL, 10.00, 10000.00, NULL, '2026-04-29 16:53:25', '2026-04-29 16:53:25', 0),
(5, 'Milan Night', 'main', '21:00:00', '23:00:00', '23:30:00', 'open', NULL, NULL, NULL, 10.00, 10000.00, NULL, '2026-04-29 16:53:25', '2026-04-29 16:53:25', 0),
(6, 'Time Bazar', 'main', '11:00:00', '12:30:00', '12:45:00', 'open', NULL, NULL, NULL, 10.00, 5000.00, NULL, '2026-04-29 16:53:25', '2026-04-29 16:53:25', 0),
(7, 'Sridevi', 'main', '11:30:00', '12:30:00', '12:45:00', 'open', NULL, NULL, NULL, 10.00, 5000.00, NULL, '2026-04-29 16:53:25', '2026-04-29 16:53:25', 0),
(8, 'Starline Morning', 'starline', '09:00:00', '09:30:00', '09:45:00', 'open', NULL, NULL, NULL, 10.00, 5000.00, NULL, '2026-04-30 18:52:31', '2026-04-30 18:52:31', 0),
(9, 'Starline Noon', 'starline', '12:00:00', '12:30:00', '12:45:00', '', NULL, NULL, NULL, 10.00, 5000.00, NULL, '2026-04-30 18:52:31', '2026-04-30 18:52:31', 0),
(10, 'Starline Evening', 'starline', '17:00:00', '17:30:00', '17:45:00', 'open', NULL, NULL, NULL, 10.00, 5000.00, NULL, '2026-04-30 18:52:31', '2026-04-30 18:52:31', 0),
(11, 'Starline Night', 'starline', '21:00:00', '21:30:00', '21:45:00', 'open', NULL, NULL, NULL, 10.00, 5000.00, NULL, '2026-04-30 18:52:31', '2026-04-30 18:52:31', 0),
(12, 'Disawar', 'disawar', '05:00:00', '04:30:00', '05:00:00', 'open', NULL, NULL, NULL, 10.00, 5000.00, NULL, '2026-04-30 18:52:31', '2026-04-30 18:52:31', 0),
(13, 'Gali', 'disawar', '23:00:00', '22:30:00', '23:00:00', 'open', NULL, NULL, NULL, 10.00, 5000.00, NULL, '2026-04-30 18:52:31', '2026-04-30 18:52:31', 0),
(14, 'Faridabad', 'disawar', '18:00:00', '17:30:00', '18:00:00', 'open', NULL, NULL, NULL, 10.00, 5000.00, NULL, '2026-04-30 18:52:31', '2026-04-30 18:52:31', 0),
(15, 'Gaziyabad', 'disawar', '20:00:00', '19:30:00', '20:00:00', 'open', NULL, NULL, NULL, 10.00, 5000.00, NULL, '2026-04-30 18:52:31', '2026-04-30 18:52:31', 0);

-- --------------------------------------------------------

--
-- Table structure for table `notices`
--

CREATE TABLE `notices` (
  `id` int(10) UNSIGNED NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','warning','success','danger') DEFAULT 'info',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `notices`
--

INSERT INTO `notices` (`id`, `message`, `type`, `is_active`, `created_at`) VALUES
(1, '🎯 MatkaKing SAKTA MATKA mein aapka swagat hai! Khelo aur jeeto!', 'success', 1, '2026-04-29 16:53:25'),
(2, '💰 Withdrawal sirf winning wallet se hogi. Min ₹500.', 'info', 1, '2026-04-29 16:53:25');

-- --------------------------------------------------------

--
-- Table structure for table `site_settings`
--

CREATE TABLE `site_settings` (
  `id` int(10) UNSIGNED NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `site_settings`
--

INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES
(1, 'upi_id', 'yourname@upi', '2026-04-29 16:53:25'),
(2, 'upi_name', 'MatkaKing', '2026-04-29 16:53:25'),
(3, 'min_deposit', '100', '2026-04-29 16:53:25'),
(4, 'max_deposit', '100000', '2026-04-29 16:53:25'),
(5, 'min_withdrawal', '500', '2026-04-29 16:53:25'),
(6, 'max_withdrawal', '50000', '2026-04-29 16:53:25'),
(7, 'whatsapp_support', '9999999999', '2026-04-29 16:53:25'),
(8, 'site_name', 'MatkaKing SAKTA MATKA', '2026-04-29 16:53:25'),
(9, 'maintenance_mode', '0', '2026-04-29 16:53:25');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `type` enum('credit','debit') NOT NULL,
  `wallet_type` enum('wallet','winning_wallet') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `reference_id` int(10) UNSIGNED DEFAULT NULL,
  `status` enum('pending','completed','failed') DEFAULT 'completed',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `user_id`, `type`, `wallet_type`, `amount`, `description`, `reference_id`, `status`, `created_at`) VALUES
(1, 2, 'credit', 'wallet', 100000.00, 'Admin credited ₹100000', NULL, 'completed', '2026-04-30 02:03:14'),
(2, 2, 'debit', 'wallet', 500.00, 'Bid placed: Time Bazar - Single Digit - 2', 1, 'completed', '2026-04-30 02:03:28'),
(3, 3, 'credit', 'wallet', 8538286.00, 'Admin credited ₹8538286', NULL, 'completed', '2026-04-30 02:17:02'),
(4, 2, 'credit', 'wallet', 1000.00, 'Deposit approved by Admin', 1, 'completed', '2026-04-30 02:21:04'),
(5, 2, 'credit', 'wallet', 10000.00, 'Admin credited ₹10000', NULL, 'completed', '2026-04-30 02:22:07'),
(6, 2, 'credit', 'wallet', 7737372.00, 'Admin credited ₹7737372', NULL, 'completed', '2026-04-30 02:24:00'),
(7, 6, 'credit', 'wallet', 1000000.00, 'Admin credited ₹1000000', NULL, 'completed', '2026-04-30 15:39:51'),
(8, 2, 'credit', 'wallet', 10000.00, 'Admin credited ₹10000', NULL, 'completed', '2026-04-30 16:01:00'),
(9, 2, 'debit', 'wallet', 200.00, 'Bid placed: Time Bazar - Jodi Bulk - 18', 2, 'completed', '2026-04-30 16:52:35'),
(10, 2, 'credit', 'wallet', 10000.00, 'Admin credited ₹10000', NULL, 'completed', '2026-04-30 17:17:04'),
(11, 2, 'debit', 'wallet', 200.00, 'Bid placed: Disawar - Single Digit - 2', 3, 'completed', '2026-04-30 19:00:31'),
(12, 2, 'debit', 'wallet', 10.00, 'Bid: 🎰 Disawar Disawar | Single Digit | 0', 4, 'completed', '2026-05-01 16:42:42'),
(13, 2, 'debit', 'wallet', 200.00, 'Bid: 🎰 Disawar Disawar | Single Digit Bulk | 7', 5, 'completed', '2026-05-02 01:05:44'),
(14, 2, 'debit', 'wallet', 200.00, 'Bid: ⭐ Starline Starline Morning | Half Sangam B | 579-7', 6, 'completed', '2026-05-02 01:06:16'),
(15, 2, 'debit', 'wallet', 10.00, 'Bid: 🎰 Disawar Disawar | Single Digit | 0', 7, 'completed', '2026-05-02 17:21:53'),
(16, 2, 'debit', 'wallet', 50.00, 'Bid: 🎰 Disawar Disawar | Single Digit | 0', 8, 'completed', '2026-05-02 17:22:23'),
(17, 2, 'debit', 'wallet', 10.00, 'Bid: 🎰 Disawar Disawar | Single Digit Bulk | 0', 9, 'completed', '2026-05-02 17:23:50'),
(18, 2, 'debit', 'wallet', 10.00, 'Bid: 🎰 Disawar Disawar | Single Digit Bulk | 1', 10, 'completed', '2026-05-02 17:23:52'),
(19, 2, 'debit', 'wallet', 50.00, 'Bid: 🎰 Disawar Disawar | Single Digit Bulk | 2', 11, 'completed', '2026-05-02 17:23:53'),
(20, 2, 'debit', 'wallet', 100.00, 'Bid: 🎰 Disawar Disawar | Single Digit Bulk | 9', 12, 'completed', '2026-05-02 17:23:54'),
(21, 2, 'debit', 'wallet', 10.00, 'Bid: 🎰 Disawar Disawar | Jodi Digit | 00', 13, 'completed', '2026-05-02 17:24:31'),
(22, 2, 'debit', 'wallet', 10.00, 'Bid: 🎰 Disawar Disawar | Single Pana | 128', 14, 'completed', '2026-05-02 17:25:54'),
(23, 2, 'debit', 'wallet', 10.00, 'Bid: 🎰 Disawar Disawar | Triple Pana | 000', 15, 'completed', '2026-05-02 17:27:21'),
(24, 2, 'debit', 'wallet', 10.00, 'Bid: 🎰 Disawar Disawar | Half Sangam A | 0-128', 16, 'completed', '2026-05-02 17:29:16'),
(25, 2, 'debit', 'wallet', 50.00, 'Bid: ⭐ Starline Starline Morning | Half Sangam B | 128-0', 17, 'completed', '2026-05-02 17:30:03'),
(26, 2, 'debit', 'wallet', 200.00, 'Bid: 🎰 Disawar Disawar | Single Digit | 7', 18, 'completed', '2026-05-03 11:33:43'),
(27, 2, 'debit', 'wallet', 500.00, 'Bid: 🎰 Disawar Disawar | Single Digit Bulk | 7', 19, 'completed', '2026-05-03 11:57:39'),
(28, 2, 'debit', 'wallet', 200.00, 'Bid: 🎰 Disawar Disawar | Single Digit Bulk | 3', 20, 'completed', '2026-05-03 11:57:39'),
(29, 3, 'debit', 'wallet', 500.00, 'Bid: 🎰 Disawar Disawar | Single Digit | 0', 21, 'completed', '2026-05-04 03:21:07'),
(30, 3, 'debit', 'wallet', 20.00, 'Bid: 🎰 Disawar Disawar | Single Digit Bulk | 3', 22, 'completed', '2026-05-04 03:24:44'),
(31, 3, 'debit', 'wallet', 100.00, 'Bid: 🎰 Disawar Disawar | Single Digit Bulk | 9', 23, 'completed', '2026-05-04 03:24:45'),
(32, 3, 'debit', 'wallet', 20.00, 'Bid: 🎰 Disawar Disawar | Single Digit Bulk | 7', 24, 'completed', '2026-05-04 03:24:47'),
(33, 3, 'debit', 'wallet', 10.00, 'Bid: 🎰 Disawar Disawar | Half Sangam A | 0-128', 25, 'completed', '2026-05-04 03:31:16'),
(34, 3, 'debit', 'wallet', 10.00, 'Bid: 🎰 Disawar Disawar | Half Sangam B | 128-0', 26, 'completed', '2026-05-04 03:31:36'),
(35, 3, 'debit', 'wallet', 10.00, 'Bid: 🎰 Disawar Disawar | Two Digit Pana | 00|128', 27, 'completed', '2026-05-04 03:45:08'),
(36, 2, 'debit', 'wallet', 500.00, 'Bid: 🎰 Disawar Disawar | Single Digit | 2', 28, 'completed', '2026-05-08 02:22:00'),
(37, 26, 'credit', 'wallet', 100.00, 'Admin credited ₹100', NULL, 'completed', '2026-05-21 12:29:39'),
(38, 18, 'credit', 'wallet', 100.00, 'Deposit approved by Admin', 4, 'completed', '2026-05-21 12:36:28'),
(39, 2, 'credit', 'wallet', 2000.00, 'Deposit approved by Admin', 3, 'completed', '2026-05-21 12:36:30'),
(40, 2, 'credit', 'wallet', 5000.00, 'Deposit approved by Admin', 2, 'completed', '2026-05-21 12:36:31'),
(41, 26, 'credit', 'wallet', 500.00, 'Admin credited ₹500', NULL, 'completed', '2026-05-21 13:35:20'),
(42, 3, 'debit', 'wallet', 10.00, 'Bid:  Time Bazar | SP DP TP | 128', 29, 'completed', '2026-05-23 01:28:56'),
(43, 2, 'credit', 'wallet', 5000.00, 'Deposit approved by Admin', 5, 'completed', '2026-05-24 12:31:06'),
(44, 3, 'debit', 'wallet', 10.00, 'Bid: ⭐ Starline Starline Morning | SP DP TP | 128', 8, 'completed', '2026-05-24 15:51:37'),
(45, 2, 'debit', 'wallet', 500.00, 'Bid: 🎰 Disawar Disawar | DP Common | 112', 31, 'completed', '2026-05-31 11:05:17'),
(46, 2, 'debit', 'wallet', 50.00, 'Bid: ⭐ Starline Starline Night | Single Digit | 1', 11, 'completed', '2026-06-04 11:32:56'),
(47, 2, 'debit', 'wallet', 200.00, 'Bid: ⭐ Starline Starline Night | SP Common | 345', 11, 'completed', '2026-06-04 11:58:52'),
(48, 2, 'debit', 'wallet', 100.00, 'Bid: ⭐ Starline Starline Night | SP Common | 246', 11, 'completed', '2026-06-04 12:00:57'),
(49, 3, 'debit', 'wallet', 100.00, 'Bid: ⭐ Starline Starline Morning | DP Motor | 200', 8, 'completed', '2026-06-11 15:00:46'),
(50, 2, 'credit', 'wallet', 1000.00, 'Deposit approved by Admin', 6, 'completed', '2026-07-02 11:03:18'),
(51, 44, 'credit', 'wallet', 100.00, 'Admin credited ₹100', NULL, 'completed', '2026-07-02 11:03:39'),
(52, 43, 'credit', 'wallet', 10000.00, 'Admin credited ₹10000', NULL, 'completed', '2026-07-02 11:04:21'),
(53, 2, 'debit', 'wallet', 10.00, 'Bid: 🎰 Disawar Disawar | Jodi Digit | 18', 12, 'completed', '2026-07-18 07:54:24'),
(54, 2, 'debit', 'wallet', 10.00, 'Bid: 🎰 Disawar Disawar | Jodi Digit | 23', 12, 'completed', '2026-07-18 07:55:33'),
(55, 2, 'debit', 'wallet', 50.00, 'Bid: 🎰 Disawar Disawar | Jodi Digit | 22', 12, 'completed', '2026-07-18 07:57:47'),
(56, 2, 'debit', 'wallet', 10.00, 'Bid: 🎰 Disawar Disawar | Jodi Digit | 11', 39, 'completed', '2026-07-21 07:30:33');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `wallet_balance` decimal(10,2) DEFAULT 0.00,
  `winning_balance` decimal(10,2) DEFAULT 0.00,
  `is_blocked` tinyint(1) DEFAULT 0,
  `referred_by` int(10) UNSIGNED DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `profile_pic` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `mobile`, `password`, `role`, `wallet_balance`, `winning_balance`, `is_blocked`, `referred_by`, `last_login`, `created_at`, `updated_at`, `profile_pic`) VALUES
(2, 'ps', '8426012042', '$2a$10$VisKO8Os1FozNVMnZNlCFuoXPWabyezlOWvMZD9radHdNp5TmI4CO', 'admin', 7877412.00, 0.00, 0, NULL, '2026-07-24 02:49:05', '2026-04-29 17:21:53', '2026-07-24 02:49:05', '/uploads/avatars/user-2-1777777550929.png'),
(3, 'Riyan', '8000982774', '$2a$10$dV1BACFtk4fqGt/l/eA19uXt5ZWW2XVmkHUI/283ywk9sIA77ke7W', 'user', 8537496.00, 0.00, 0, NULL, '2026-07-24 02:51:13', '2026-04-29 17:53:51', '2026-07-24 02:51:13', '/uploads/avatars/user-3-1777825373374.jpg'),
(4, 'Ppppp', '8426012041', '$2a$10$66g/iZUbkW0cLS3WhAFPeO2HJFBjbaVM0/fHrf6CnOjqSRswqkJoi', 'user', 0.00, 0.00, 0, NULL, '2026-04-30 02:50:58', '2026-04-30 01:16:10', '2026-04-30 02:50:58', NULL),
(5, 'Uwjj', '9999999996', '$2a$10$HvgBTPkQMlkaxsLCDiUH/euMbn4AOcaVTKZAQ3Lenbfp/s9Hymcdm', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-04-30 02:00:50', '2026-04-30 02:00:50', NULL),
(6, 'mmmmmmm', '9639639639', '$2a$10$WxXKt1.WvPoyXFJUqHmX1ewN6aFMNPgJUazecJZ3uvQlJGrBTWOC6', 'user', 1000000.00, 0.00, 0, NULL, '2026-04-30 15:40:28', '2026-04-30 15:38:10', '2026-04-30 15:40:28', NULL),
(7, 'kjwndkjw', '8426012043', '$2a$10$WCbOaPOFSK0viwDoyQexqujoIPBpeRf46xeMnR0VLkpZPtGaMKYiq', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-05-01 15:54:14', '2026-05-01 15:54:14', NULL),
(8, 'Kartik', '8824510089', '$2a$10$S0dgeelkLRKALzbRbziqk.AIviJ7cTJvhkt45K/KT2kk5RCn802H.', 'user', 0.00, 0.00, 0, NULL, '2026-05-03 13:02:59', '2026-05-01 16:42:03', '2026-05-03 13:02:59', NULL),
(9, 'Majid', '9650130127', '$2a$10$vu68p16ex5uAeONGPzFie.BI.nG3BCxdm47VpNisFw7h7.MTgMQCS', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-05-02 09:37:01', '2026-05-02 09:37:01', NULL),
(10, 'Rana sk', '8345982108', '$2a$10$eJrS4LWwg7ZT8xPPgyimpuZE1ENrTR5JgS2JcK8Nbn4Go66/kKxDm', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-05-04 08:38:15', '2026-05-04 08:38:15', NULL),
(11, 'Hassan', '8965236589', '$2a$10$QNQJzpVk/PrA2KKQQn5MB.T01PDz7W66k/KZQV4Xk/dJDNxOYpu/O', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-05-04 15:54:51', '2026-05-04 15:54:51', NULL),
(12, 'Hassan', '8632568974', '$2a$10$j8eRPwfaQJaItlTQeaL8rep.jPPXu8GYCx7l4Um5cw.KnSRxxseZm', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-05-04 15:56:20', '2026-05-04 15:56:20', NULL),
(13, 'Hetva Kapdi', '8849455255', '$2a$10$wPDZf2R/GRvtp41SIvtjceFCkv1Hw4Gu0/eHYeU0OuBGyxXk6WadC', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-05-05 19:00:12', '2026-05-05 19:00:12', NULL),
(14, 'Agni Bet', '9251286299', '$2a$10$s8VMRD89aBVTS5ZxuSrshuv0vpKWHwTLLLtzfGzQMpMARf0QCzWZO', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-05-07 07:35:07', '2026-05-07 07:35:07', NULL),
(15, 'Dilip Kumar', '8426012040', '$2a$10$amlAZ92vzABt37sDPtBu/.RzwXDjKYBeG3GoTOIDkcrY1qbqgkORm', 'user', 0.00, 0.00, 0, NULL, '2026-05-08 04:43:48', '2026-05-08 04:42:04', '2026-05-08 04:43:48', NULL),
(16, 'Hjkm', '7267977827', '$2a$10$kpvIhImZiMjgDNvKdxx09udf9CVOslE4sr7afiGO1YNUOGWg5.v4e', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-05-09 19:21:04', '2026-05-09 19:21:04', NULL),
(17, 'Tffc', '7418529630', '$2a$10$YjRi7VLHDUsOrToDi7tnLOhULN2PGV/a4lvP1yVxscukWJjTquvCS', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-05-11 20:42:28', '2026-05-11 20:42:28', NULL),
(18, 'Javed', '7068563635', '$2a$10$FLc3LGxCc5lz0kSKuM5KMezy5JMtfkPX/9bLTXAWjO5kNrzypmHXq', 'user', 100.00, 0.00, 0, NULL, NULL, '2026-05-12 07:08:10', '2026-05-21 12:36:28', NULL),
(19, 'abhijeet', '7905157273', '$2a$10$mOpbCuZ9HZ1ls7zsBGo/7ONlVZAYF9sSay5x0Mbn2/pO7cIS6RrXG', 'user', 0.00, 0.00, 0, NULL, '2026-05-14 07:24:03', '2026-05-12 13:16:02', '2026-05-14 07:24:03', NULL),
(20, 'Arun pal', '8900357251', '$2a$10$mN17maLm4cCFExlB1c7dge.uKeeHvrwGJHLEL0ORPf0kmqfNYAYfC', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-05-14 08:24:17', '2026-05-14 08:24:17', NULL),
(21, 'Rahul', '7797909821', '$2a$10$kAuAk68j1FYy40026YKCZewLFzyxmRxNDa9oCxovXbD3vODVFzJ8G', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-05-14 08:28:51', '2026-05-14 08:28:51', NULL),
(22, 'Rahul', '9907953797', '$2a$10$jh6GQ2bp4aUjSE9AeDyR9./sSS5/2FYJS4bh4g4pWf2GuQ1aLjBg.', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-05-14 08:30:40', '2026-05-14 08:30:40', NULL),
(23, 'Prabhat yadav', '9296214009', '$2a$10$1YZqgbJTf5OCm57bXkDxPuoVmVhS731DudtJDiBg4HHW.U1iA4.Ji', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-05-16 06:13:51', '2026-05-16 06:13:51', NULL),
(24, 'Giriraj', '8769838378', '$2a$10$guXA.bTUz15cP2KmQgChOueTJVZVIuhFwsr2LRIB8/RIXi850PJmO', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-05-17 10:32:40', '2026-05-17 10:32:40', NULL),
(25, 'Guru ji', '9754235645', '$2a$10$EzU8uyIJtvxbrkT.E1OMw.X5es7lql57FRUUg06mouMzyu9LJKxVq', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-05-17 19:29:52', '2026-05-17 19:29:52', NULL),
(26, 'Keshav', '9999658154', '$2a$10$s1qD.unbFCoGHhxsMPfvkeApBgUhpxLW5kreUmlJMmk/tsc/ERrAq', 'user', 600.00, 0.00, 0, NULL, NULL, '2026-05-21 12:06:37', '2026-05-21 13:35:20', NULL),
(27, 'Abhi', '8888888888', '$2a$10$vQVyT/.e.8mEU/uu50W..OGRfApeEnDhHhtAW9P7i4wtvcCU8hiZ.', 'user', 0.00, 0.00, 0, NULL, '2026-05-28 05:31:46', '2026-05-28 05:20:17', '2026-05-28 05:31:46', NULL),
(28, 'Kalyan', '9399529464', '$2a$10$LAiElP7SGe1U/DBtoYaKpuSgNjqQlsxQdRF6c1GoAEN6oOPt0ivCe', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-05-30 03:55:38', '2026-05-30 03:55:38', NULL),
(29, 'tttttt', '7878787878', '$2a$10$YYYiv04JIz2e19zZSGnncuIyC29IbmKFiwlRYKVnhr5Pj89/dq3O6', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-05-31 11:03:20', '2026-05-31 11:03:20', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky&backgroundColor=ff8800'),
(30, 'nkhjk', '9845154861', '$2a$10$zMtGuFPx3HaVTFEE5rc2k.UOHVL2khePOcR5OFJMg/czSh2xTBomm', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-05-31 11:08:39', '2026-05-31 11:08:39', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Star&backgroundColor=8800ff'),
(31, '8451212132', '9234545611', '$2a$10$sYPJLOP8HEAlWlK7fj4TRuFSvK0YBafnbnIRKMg/8r/k4gTVmQmGS', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-05-31 11:10:26', '2026-05-31 11:10:26', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hero&backgroundColor=ff2244'),
(32, 'Jshdhdh', '7648833693', '$2a$10$0PQev9gVFl9VSnyPoKSe0O9zkhEOMiUBhytffOntTKCqN.IPUUxHK', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-06-01 14:57:40', '2026-06-01 14:57:40', NULL),
(33, 'UGAR STORE', '6372182367', '$2a$10$W.4dm195Wdz/Gs1CY6oluuhyRYNMka2.rxoCEBB1mLnaXU3NU1V4G', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-06-07 06:59:05', '2026-06-07 06:59:05', NULL),
(34, 'Hemraj', '9632580741', '$2a$10$4VAq8K.itg7pCFxiEYkFY./asWrIrJnQlrXfsLS.DERbLarZrZAgi', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-06-09 11:10:54', '2026-06-09 11:10:54', NULL),
(35, 'Hemraj', '9874563210', '$2a$10$lhPnkuMxkD9gxOS/ON69TuGzc4nWDnxcmF8uzbpvnajAgtVN6c22a', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-06-13 14:08:10', '2026-06-13 14:08:10', NULL),
(36, 'Hemra', '9876543210', '$2a$10$XG4U8VTshQOK/NDdfDRXoukCehYMMwi1ncMeXOlSXYGINJH9zq9qe', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-06-13 14:09:16', '2026-06-13 14:09:16', NULL),
(37, 'Kabir Chikuwala', '9023120139', '$2a$10$Rd8f4jceCA5lgbRNgGRJf.tvhnN/51x4puipjhIOqqOJW/mhJiRxe', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-06-22 13:05:16', '2026-06-22 13:05:16', NULL),
(38, 'rohit gupta', '9464666737', '$2a$10$pfHBQdnBh9C6w8tkqzeGG.vPDsG02SQtlbzGORF5hKJs26pFYTh56', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-06-22 16:58:17', '2026-06-22 16:58:17', NULL),
(39, 'Prahlad Sharma', '8426012011', '$2a$10$a6Ff3YWD/6RCBgLsZNUzWOy9wqcTg9d8yA.HYn.hhlB7Ynp8c4KaS', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-06-22 17:39:06', '2026-06-22 17:39:06', NULL),
(40, 'Fgg', '8426012012', '$2a$10$1Shc4kc4QD7QfKyStvXYJ.JOwtPR.7WavDnKPXryifLGsf25Taca.', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-06-22 17:42:39', '2026-06-22 17:42:39', NULL),
(41, 'Ruhi tawwar', '8208374268', '$2a$10$9TZNK/yE0b9DTsRYHFom9u7Gu69gbaivSEMVdUNjmYMtm3qH7hP9i', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-06-28 05:40:13', '2026-06-28 05:40:13', NULL),
(42, 'Prahlad Sharma', '8426012063', '$2a$10$IhOWMxDYgWzZy7bj07i1/.kPaoGITHNTcWelayZFb32AG3TbEoE4G', 'user', 0.00, 0.00, 0, NULL, '2026-06-28 05:59:33', '2026-06-28 05:57:41', '2026-06-28 05:59:33', NULL),
(43, 'Singh', '9784354007', '$2a$10$kBOPcoR1xEi3Ic5Ld70xZudnJvuhVz0Ko3Po36i0NFvwtr9iDVlOW', 'user', 10000.00, 0.00, 0, NULL, NULL, '2026-06-29 14:13:17', '2026-07-02 11:04:20', NULL),
(44, 'Gufran Shaikh', '9153101375', '$2a$10$QTDPcoCMJPa/ASugbzvIbOqCGBuQz/C4o6FPnEaDQZi9lPpRoguv2', 'user', 100.00, 0.00, 0, NULL, NULL, '2026-07-01 03:16:52', '2026-07-02 11:03:39', NULL),
(45, 'Sanu', '9421451896', '$2a$10$3TZ0CZjBvJIoE2QnOuHoZOfxqInBRsyNH1r8i3XruP6UG15ycZdM.', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-07-05 14:04:40', '2026-07-05 14:04:40', NULL),
(46, 'Deepak kumar', '7004161549', '$2a$10$4g9vKHYET/S9lsUaUDKsOeUhpGm7UxGWq1kXhkYHveThw5NxiO1xa', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-07-08 13:38:41', '2026-07-08 13:38:41', NULL),
(47, 'Meena jee', '6375710869', '$2a$10$3bWxrzNR9B015mAQNKBCZeLZu2QM8/B.uWSpXNfukDUXt0637ho36', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-07-08 13:47:59', '2026-07-08 13:47:59', NULL),
(48, 'Sana', '9999999999', '$2a$10$nt7efxX0DqvycGg/3Yix3upIrkhJr9frjtbG65v932bbXsFdv/BFG', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-07-09 08:37:13', '2026-07-09 08:37:13', NULL),
(49, 'Rohit Singh', '8953884976', '$2a$10$xoWnVPG3xfBtZbvZW.fa6.eO/c66y0HqBkpxGt/CvJo3WD7f0mv6S', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-07-09 08:39:11', '2026-07-09 08:39:11', NULL),
(50, 'Ankit Roy', '9100000000', '$2a$10$g.9gVotbJjz0qOSM4DIPau803ZYa6k11qJ7oo4oxo0OeI7pfC7ThC', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-07-11 16:27:35', '2026-07-11 16:27:35', NULL),
(51, 'PRITESH PANDEY', '6306696861', '$2a$10$Yg75YdqrZrbzZj12e6O5OepGYNKa9QKDG1gE.2X7QRRIEoEkrlh2K', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-07-16 14:28:25', '2026-07-16 14:28:25', NULL),
(52, 'Aditya Kumar', '8650640390', '$2a$10$HRy.vu4DG7Md.Uuu9j/7kut2YzSrNHZ3JxRdyFVw/ZbXPKb417YAm', 'user', 0.00, 0.00, 0, NULL, NULL, '2026-07-17 04:10:37', '2026-07-17 04:10:37', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bids`
--
ALTER TABLE `bids`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_game` (`game_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `deposit_requests`
--
ALTER TABLE `deposit_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_type_status` (`type`,`status`);

--
-- Indexes for table `games`
--
ALTER TABLE `games`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notices`
--
ALTER TABLE `notices`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `site_settings`
--
ALTER TABLE `site_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mobile` (`mobile`),
  ADD KEY `idx_mobile` (`mobile`),
  ADD KEY `idx_role` (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bids`
--
ALTER TABLE `bids`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `deposit_requests`
--
ALTER TABLE `deposit_requests`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `games`
--
ALTER TABLE `games`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `notices`
--
ALTER TABLE `notices`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `site_settings`
--
ALTER TABLE `site_settings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bids`
--
ALTER TABLE `bids`
  ADD CONSTRAINT `bids_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `bids_ibfk_2` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`);

--
-- Constraints for table `deposit_requests`
--
ALTER TABLE `deposit_requests`
  ADD CONSTRAINT `deposit_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
