<div align="center">

# ?? FARMCAP SUPERAPP (MY-FIRST-APP)
### *Next-Gen Dual-Mode Agri-Commerce, Machinery Rental & SmartLens AI Ecosystem*

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Leaflet](https://img.shields.io/badge/GPS_Maps-Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com)
[![SmartLens AI](https://img.shields.io/badge/Vision_AI-SmartLens_Scanner-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![License](https://img.shields.io/badge/License-MIT-00E676?style=for-the-badge)](LICENSE)

<br/>

<p align="center">
  <a href="#-dual-mode-architecture"><b>Dual-Mode Engine</b></a> •
  <a href="#-system-architecture"><b>Architecture</b></a> •
  <a href="#-key-marketplace-pillars"><b>Marketplace Pillars</b></a> •
  <a href="#-smartlens-ai"><b>SmartLens AI</b></a> •
  <a href="#-quick-start"><b>Quick Start</b></a>
</p>

---

</div>

## ?? Executive Summary

**FarmCap SuperApp** is a comprehensive rural commerce and agritech platform built to eliminate intermediaries between farmers, equipment owners, agricultural laborers, and consumers.

Featuring a seamless **Dual-Mode System Router**, users can toggle with one tap between **Consumer/Buyer Mode** (buying farm-fresh organic produce, hiring tractors/harvesters, booking field laborers) and **Farmer/Seller Storefront** (managing inventory listings, monitoring incoming orders, broadcasting bulk harvests, and advertising services).

---

## ??? System Architecture

```mermaid
flowchart TD
    classDef client fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#fff;
    classDef buyer fill:#042f2e,stroke:#10b981,stroke-width:2px,color:#fff;
    classDef seller fill:#451a03,stroke:#f59e0b,stroke-width:2px,color:#fff;
    classDef ai fill:#1e1b4b,stroke:#a855f7,stroke-width:2px,color:#fff;
    classDef fb fill:#1e293b,stroke:#f59e0b,stroke-width:2px,color:#fff;

    subgraph User["?? User Session & Router"]
        ModeSwitch{"Mode Switch Router (UserModeContext)"}:::client
    end

    subgraph ConsumerSpace["?? Consumer / Buyer Mode"]
        FarmFresh["?? Farm Fresh Organic Produce Marketplace"]:::buyer
        HireMachinery["?? Tractor & Harvester Machinery Rental"]:::buyer
        HireWorkers["????? Farm Labor & Gig Workforce Booking"]:::buyer
        Cart["??? Smart Cart & Multi-Item Checkout"]:::buyer
    end

    subgraph SellerSpace["?? Farmer / Merchant Storefront"]
        Storefront["?? Listing & Inventory Manager"]:::seller
        OrderFlow["?? Live Order History & Fulfillment"]:::seller
        PromoEngine["?? Banner Ads & Wholesale Broadcasts"]:::seller
    end

    subgraph AIAndTools["? Agritech Intelligence Suite"]
        SmartLens["?? SmartLens Crop Disease Vision AI"]:::ai
        GPSMeasure["??? GPS Acreage & Perimeter Land Surveyor"]:::ai
        MandiRates["?? Live Mandi Commodity Price Index"]:::ai
        PDFGen["?? 1-Click PDF Expense Balance Sheets"]:::ai
    end

    subgraph CloudEngine["?? Firebase Cloud Ecosystem"]
        Firestore["Cloud Firestore (Real-Time Catalogs & Listings)"]:::fb
        Auth["Firebase Authentication (Role-Based Access)"]:::fb
        Storage["Cloud Storage (High-Res Crop Media)"]:::fb
    end

    ModeSwitch -->|Consumer Mode| ConsumerSpace
    ModeSwitch -->|Seller Mode| SellerSpace
    ConsumerSpace & SellerSpace <--> CloudEngine
    ConsumerSpace & SellerSpace <--> AIAndTools
```

---

## ?? Key Marketplace Pillars & Capabilities

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>?? Farm Machinery & Equipment Hire</h3>
      <ul>
        <li><b>Hourly / Daily Rentals:</b> Rent tractors, combine harvesters, seed drills, and power tillers from neighboring farms.</li>
        <li><b>Equipment Specifications:</b> Horsepower, fuel capacity, driver availability, and location radius filters.</li>
        <li><b>Cost Reduction:</b> Helps smallholder farmers access expensive machinery without heavy capital debt.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>????? Agricultural Workforce & Gigs</h3>
      <ul>
        <li><b>Labor Booking:</b> Hire skilled field laborers for sowing, weeding, harvesting, and pest spraying.</li>
        <li><b>Wage Transparency:</b> Verified daily wage rates and transparent booking confirmation.</li>
        <li><b>Seasonal Availability:</b> Solves critical labor shortages during peak harvest windows.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>?? Direct Farm Fresh Marketplace</h3>
      <ul>
        <li><b>Zero Middlemen:</b> Direct farmer-to-consumer commerce with fair pricing for growers and fresh food for buyers.</li>
        <li><b>Multi-Category Catalog:</b> Grains, pulses, organic vegetables, dairy, honey, and local artisanal goods.</li>
        <li><b>Order Tracking:</b> Real-time status updates from harvest pickup to doorstep delivery.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>?? SmartLens Vision AI & Tools</h3>
      <ul>
        <li><b>Visual Disease Scanner:</b> Upload plant photos to instantly identify leaf blight, rust, and pests.</li>
        <li><b>GPS Land Surveyor:</b> Accurate perimeter measurement with satellite overlay.</li>
        <li><b>Expense Ledger:</b> Track inputs, yields, and export PDF profit & loss reports.</li>
      </ul>
    </td>
  </tr>
</table>

---

## ?? Quick Start & Installation

### Prerequisites
* **Node.js** `v18+` & **npm**

```bash
# 1. Clone the repository
git clone https://github.com/maniscap/My-First-App.git
cd My-First-App

# 2. Install dependencies
npm install

# 3. Launch development server
npm run dev
```

Open **`http://localhost:5173`** in your browser to start using the SuperApp!

---

## ?? Repository Structure

```
My-First-App/
+-- public/
+-- src/
¦   +-- components/
¦   ¦   +-- Consumer/           # ?? Consumer pages (FarmFresh, HireMachinery, HireWorkers, Cart)
¦   ¦   +-- Seller/             # ?? Seller pages (ManageListings, StorefrontSetup, OrderHistory)
¦   ¦   +-- SmartLens.jsx       # ?? AI Crop Disease Scanner
¦   ¦   +-- GPSMeasurement.jsx  # ??? GPS Land & Acreage Surveyor
¦   ¦   +-- MarketRates.jsx     # ?? Live Mandi Commodity Price Index
¦   ¦   +-- CropExpenses.jsx    # ?? Expense Tracker & PDF Export
¦   ¦   +-- ChatBot.jsx         # ?? AI Farm Advisor
¦   +-- context/
¦   ¦   +-- UserModeContext.jsx # ?? Consumer vs. Seller mode state provider
¦   +-- firebase.js             # ?? Firestore & Authentication setup
¦   +-- App.jsx                 # ?? Root application component & routes
¦   +-- index.css               # ?? Design system tokens
+-- index.html
+-- package.json
+-- vite.config.js
```

---

<div align="center">
  <sub>Engineered with precision for rural digital empowerment. FarmCap SuperApp Suite &copy; 2026 Mani.</sub>
</div>
