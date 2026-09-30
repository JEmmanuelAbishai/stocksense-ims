
<div align="center">

# StockSense IMS

**Real-time inventory management system built with React, Vite, Tailwind CSS, and Node.js/Express | Powered by Google GenAI**

[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Express](https://img.shields.io/badge/Express-4.21-black?logo=express&logoColor=white)](https://expressjs.com)
[![License](https://img.shields.io/github/license/JEmmanuelAbishai/stocksense-ims)](https://github.com/JEmmanuelAbishai/stocksense-ims/blob/main/LICENSE)

</div>

---

## Demo

<div align="center">

![Overview](public/demo.gif)
<div> The main dashboard showing real-time inventory KPIs and analytics </div>


</div>

---

## Overview

A modern Inventory Management System (IMS) designed to streamline stock tracking, warehouse operations, product cataloging, and ledger auditing. Built with a responsive React frontend and a robust Express backend service, it delivers real-time visibility into inventory flow.

**Domain:** Supply Chain & Inventory Management  
**Framework:** React 19, Vite, Tailwind CSS v4, Express, Lucide Icons  
**Status:** Active Development

---

## System Architecture

The architecture connects a Vite-powered React client with an Express backend server handling product catalogs, stock levels, and operations.

```mermaid
classDiagram
    class ReactFrontend {
        +InventoryContext context
        +AuthContext auth
        +ThemeContext theme
    }
    class ExpressServer {
        +DashboardRouter dashboard
        +OperationsRouter operations
        +ProductsRouter products
        +StockRouter stock
    }
    class DataStore {
        +JSONStorage store
        +manageProducts()
        +trackLedger()
    }

    ReactFrontend ..> ExpressServer : API calls
    ExpressServer --> DataStore : persists data
```

---

## Operations Pipeline

The backend manages multiple inventory operations including receipts, deliveries, transfers, and adjustments.

```mermaid
graph LR
    A[Incoming Receipts] --> B[Stock Engine]
    C[Outgoing Deliveries] --> B
    D[Internal Transfers] --> B
    E[Stock Adjustments] --> B
    B --> F[Ledger & Analytics]
  
```

---

## Features

- **Real-time Analytics**: Comprehensive dashboard tracking inventory KPIs, stock levels, and operation trends.
- **Operations Management**: Handle receipts, deliveries, transfers, and stock adjustments with detailed modal views.
- **Product Catalog**: Manage stock locations, product attributes, and inventory thresholds.
- **Ledger Auditing**: Complete audit trail of all stock movements and ledger entries.

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

1. Open your browser and navigate to `http://localhost:3000`.
2. Use the interface to manage inventory, products, and operational logs.
3. (Or) Run the live link `https://ims-stocksense.vercel.app/`

## Authors & Contributors

| Name | Role | Key Contribution |
| :--- | :--- | :--- |
| [SiddarthReddyK](https://github.com/SiddarthReddyK) | Lead Developer / UI Designer | Responsive API & quick action triggers| 
| [suchith2510](https://github.com/suchith2510) | User Access / Product Managment | Integrate user authentication & warehouse configurations |
| [pranay339](https://github.com/pranay339) | Operations Integration | Focus on receipts and dispatches |
| [JEmmanuelAbishai](https://github.com/JEmmanuelAbishai) | Audit-Ledger Integration | Implement stock logging mechanism, along with phyiscal count |
```
