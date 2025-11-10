# FuelEU Maritime Compliance API

A full-stack application for managing maritime vessel compliance under the FuelEU Maritime Regulation, including GHG emissions tracking, compliance balance calculation, banking systems, and pooling agreements.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Screenshots](#screenshots)
- [License](#license)

---

## 🌊 Overview

The FuelEU Maritime Compliance API helps shipping companies:

- Calculate **Compliance Balance (CB)** based on GHG intensity vs FuelEU targets
- Manage **route data** with baseline selection for compliance comparison
- **Bank surplus credits** for future use or borrow from previous years
- Create **pooling agreements** to share compliance balance across vessels
- **Avoid penalties** by optimizing fuel usage and leveraging compliance mechanisms

---

## ✨ Features

### 🚢 Route Management
- CRUD operations for shipping routes
- Baseline route selection
- Route comparison against FuelEU targets (2025-2030)
- Support for multiple fuel types (HFO, LNG, Biofuel, Methanol)

### 📊 Compliance Balance Calculation
- Automatic CB calculation using FuelEU formula
- GHG intensity validation against yearly targets
- Surplus/deficit identification
- Penalty calculation (€2,400 per tonne CO₂ deficit)

### 💰 Banking System
- Save surplus compliance credits
- Borrow from banked credits to offset deficits
- Transaction history tracking
- Balance management

### 🤝 Pooling Agreements
- Create multi-ship compliance pools
- Aggregate compliance balance across vessels
- Share surplus to offset deficits
- Pool-wide penalty calculation and distribution

---

## 🏗️ Architecture

This project follows **Hexagonal Architecture (Ports & Adapters)** for both backend and frontend.


## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL 14+
- **ORM:** TypeORM

### Frontend
- **Framework:** React 18+
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Date Formatting:** date-fns