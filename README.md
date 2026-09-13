# CyberPulse

An integrated computer shop (cybercafe) management dashboard prototype built with React, TypeScript, and Tailwind CSS.

## Overview
CyberPulse eliminates the need for separate apps by combining the cash register, PC timers, and snack inventory into one centralized system. When a cashier sells PC time and snacks at the POS, the system automatically starts the PC timer, deducts the inventory, logs the transaction, and updates the daily revenue.

## Key Features
- **Point of Sale (POS)**: Sell PC time and snacks in a unified transaction.
- **PC Management**: Real-time status tracking (Available, In Use, Sleeping) and simulated Wake-on-LAN.
- **Inventory Management**: Auto-deducts stock when items are sold via POS.
- **Shift Management**: Cashier accountability with blind cash counts.
- **Analytics**: Demand forecasting, peak hours, and revenue tracking.

## Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS v4, Vite
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: React Context + useReducer (with LocalStorage persistence)

## How to Run Locally
1. Clone the repository: git clone https://github.com/Cyrus9177/Cyberpulse.git
2. Navigate to the folder: cd Cyberpulse
3. Install dependencies: 
pm install
4. Start the dev server: 
pm run dev
5. Open http://localhost:5173/ in your browser.
