# OFDM Calculator (MERN Stack)

A full-stack web application built with the MERN (MongoDB, Express, React, Node.js) stack to dynamically calculate Orthogonal Frequency-Division Multiplexing (OFDM) parameters for 5G NR & LTE subframes.

## Features
- **Dynamic Calculation**: Calculates derived parameters (CP Size, Subcarrier Allocations, Bits per Symbol, etc.) based on base inputs like FFT Size, Sampling Rate, Subcarrier Spacing, and Modulation Scheme.
- **Performance Analytics**: Computes timing (Symbol Length, Symbol Duration, Subframe Length), data rates (Total Bits, Raw Data Rate), and MAC Throughput after Forward Error Correction (FEC).
- **Occupied Bandwidth Breakdown**: Calculates the exact occupied bandwidth based on the total number of used subcarriers.
- **History Tracking**: Automatically saves your calculations to a MongoDB database, allowing you to easily retrieve and review past results.
- **Modern UI**: A responsive, modern "glassmorphic" interface built with React and Vite.

## Project Structure
- `/frontend`: React + Vite application (UI, deployed on Vercel)
- `/backend`: Node.js + Express API (Logic & Database interactions, deployed on Render)

## Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local installation or MongoDB Atlas cluster)

## Local Development Setup

### 1. Database
Make sure you have MongoDB running locally on port `27017` (default) or use a MongoDB Atlas configuration.

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. (Optional) Create a `.env` file in the `backend` directory to override defaults:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/ofdm_calculator
   FRONTEND_URL=http://localhost:5173
   ```
4. Start the backend development server:
   ```bash
   nodemon server.js
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. (Optional) Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`.

## Deployment Strategy
The recommended free-tier structure for deploying this app is:
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Backend API**: [Render](https://render.com/) (Node.js Web Service)
  - **Build Command**: `npm install`
  - **Start Command**: `node server.js`
- **Frontend App**: [Vercel](https://vercel.com/) (Vite/React preset)

*Be sure to properly configure your `FRONTEND_URL` and `MONGO_URI` variables on Render, and your `VITE_API_URL` variable on Vercel.*
