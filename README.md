# StockSense IMS

A modular, real-time Inventory Management System designed to digitize stock-related operations, replace manual spreadsheets, and streamline warehouse workflows. Built for Odoo Hackathon 2026.

## Features

- **Product Management**: Create, update, and track items with SKU codes, categories, units of measure, and reordering rules.
- **Operations Engine**: Handle incoming receipts, outgoing delivery orders, internal warehouse transfers, and stock adjustments.
- **Stock Ledger**: Every movement is securely logged for complete audit trails.
- **Dashboard & KPIs**: Real-time insights on stock levels, low-stock alerts, pending receipts, and pending deliveries.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Motion
- **Backend**: Node.js, Express
- **Database & Storage**: Custom data store / modular backend services

## Project Structure

```text
├── server/               # Express backend & API routes
│   ├── db/               # Data storage configuration
│   └── routes/           # Dashboard, operations, products, and stock routes
├── src/                  # React frontend source
│   ├── components/       # Modular UI views (Dashboard, Operations, Ledger, Products, Settings)
│   ├── context/          # React context providers (Auth, Inventory)
│   ├── data/             # Initial mock/seed data
│   ├── services/         # API service wrappers
│   └── types/            # TypeScript interfaces
├── Dockerfile            # Container configuration
└── package.json          # Project dependencies & scripts