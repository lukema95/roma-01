# ROMA Trading Frontend - UI Redesign

## Overview

The frontend has been completely redesigned with a modern, minimalist white-background interface inspired by Alpha Arena. The new design focuses on clarity, usability, and real-time monitoring of multiple AI trading agents.

## Key Features

### 1. **Main Dashboard Layout**

The dashboard is organized into several key sections:

#### Header
- **Logo and Branding**: Clean ROMA Trading logo with gradient blue accent
- **Status Indicators**: Shows number of active models and total models
- **Price Ticker**: Live cryptocurrency prices for all trading pairs (BTC, ETH, SOL, BNB, DOGE, XRP)
  - Real-time price updates
  - 24h change percentage with visual indicators
  - Hover effects for better UX

#### Main Content Area
**Left Side (2/3 width):**
- **Multi-Agent Equity Chart**: Line chart displaying all agents' account values on a single graph
  - Each agent has a unique color
  - Interactive tooltips showing detailed values
  - Time range filters (ALL / 72H)
  - Real-time updates every 30 seconds

**Right Side (1/3 width):**
- **Tabs Panel** with two views:
  1. **POSITIONS**: Shows all current open positions across agents
     - Filter by specific agent or view all
     - Color-coded LONG/SHORT indicators
     - Real-time P&L tracking
     - Entry/Mark prices and leverage display
  
  2. **COMPLETED TRADES**: Historical trade records
     - Last 100 trades across all agents
     - Profit/Loss with percentage
     - Holding time calculation
     - Filterable by agent

#### Bottom Section
- **Agent Balance Cards**: Grid of cards showing each agent's performance
  - Live status indicator (● LIVE / ○ OFF)
  - Current balance and P&L percentage
  - Color-coded profit/loss indicators
  - Click to navigate to agent detail page
  - Unique icon and color for each agent

### 2. **Agent Detail Page**

When clicking on an agent card, users navigate to a detailed view:

#### Header
- Back to dashboard navigation
- Agent name and status
- Runtime metrics (cycle count, runtime minutes)

#### Sections
1. **Account Summary Cards**:
   - Total Balance
   - Available Balance
   - Unrealized P&L (color-coded)
   - Win Rate

2. **Current Positions Table**:
   - Comprehensive position details
   - Hover effects for better readability
   - Color-coded sides and P&L

3. **Recent Decisions**:
   - Last 5 AI decision cycles
   - Action details and reasoning
   - Timestamp tracking

4. **Performance Metrics Grid**:
   - Total Trades
   - Wins/Losses
   - Profit Factor
   - Sharpe Ratio
   - Average Profit/Loss
   - Max Drawdown
   - Total P&L

## Design System

### Color Palette

**Background:**
- Main background: `#f9fafb` (gray-50)
- Card background: `#ffffff` (white)
- Borders: `#e5e7eb` (gray-200)

**Text:**
- Primary text: `#111827` (gray-900)
- Secondary text: `#6b7280` (gray-600)
- Muted text: `#9ca3af` (gray-400)

**Status Colors:**
- Success/Profit: `#22c55e` (green-600)
- Error/Loss: `#ef4444` (red-600)
- Accent: `#3b82f6` (blue-600)
- Warning: `#f59e0b` (amber-600)

**Agent Colors:**
```typescript
const AGENT_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
];
```

### Typography

- **Font Family**: 
  - UI: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif`
  - Numbers: `font-mono` for consistent width

- **Font Sizes**:
  - Page titles: `text-2xl` to `text-3xl` (24-30px)
  - Section headers: `text-xl` (20px)
  - Body text: `text-sm` to `text-base` (14-16px)
  - Small labels: `text-xs` (12px)

### Components

#### Cards
```css
.card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem; /* 12px */
  padding: 1.5rem; /* 24px */
  box-shadow: hover:shadow-md;
  transition: all 0.2s;
}
```

#### Buttons
- Primary: Blue background (`bg-blue-600`)
- Secondary: Gray background (`bg-gray-100`)
- Rounded corners: `rounded-lg`
- Hover effects for all interactive elements

#### Status Badges
- Pill-shaped with rounded corners
- Background opacity for subtle effect
- Bold font weight for emphasis

## Responsive Design

The layout is fully responsive:

- **Desktop (≥1024px)**: 
  - Chart and tabs in 2:1 grid
  - 6-column agent cards grid

- **Tablet (768px-1023px)**:
  - Stacked layout for chart and tabs
  - 3-column agent cards grid

- **Mobile (<768px)**:
  - Single column layout
  - Horizontal scrolling for price ticker
  - 1-column agent cards

## Technical Implementation

### Key Technologies
- **Framework**: Next.js 14 with App Router
- **State Management**: SWR for data fetching and caching
- **Charts**: Recharts for all visualizations
- **Styling**: Tailwind CSS with custom utilities
- **Icons**: Lucide React

### Performance Optimizations
- **Data Caching**: SWR with smart refetch intervals
  - Prices: 10s refresh
  - Charts: 30s refresh
  - Positions/Trades: 10s refresh
- **Lazy Loading**: Components load on demand
- **Memoization**: Chart data processing optimized
- **Smooth Animations**: CSS transitions for all state changes

### Real-Time Updates
All data refreshes automatically:
- Agent status and balances: 10s
- Price ticker: 3s
- Charts: 30s
- Positions and trades: 10s

## User Experience Enhancements

1. **Loading States**: 
   - Skeleton screens for initial load
   - Spinner for data fetching
   - Smooth transitions

2. **Hover Effects**:
   - Cards scale slightly on hover
   - Shadow depth increases
   - Color transitions

3. **Visual Feedback**:
   - Active states for tabs
   - Color-coded profit/loss everywhere
   - Status indicators with pulsing animation

4. **Accessibility**:
   - High contrast ratios
   - Keyboard navigation support
   - Semantic HTML structure
   - ARIA labels where needed

## File Structure

```
frontend/src/
├── app/
│   ├── page.tsx                    # Main dashboard
│   ├── agent/[id]/page.tsx         # Agent detail page
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
├── components/
│   ├── PriceTicker.tsx             # Top price bar
│   ├── MultiAgentChart.tsx         # Multi-agent equity chart
│   ├── AgentBalanceCards.tsx       # Bottom agent cards
│   └── RightSideTabs.tsx           # Positions/Trades tabs
├── lib/
│   └── api.ts                      # API client
└── types/
    └── index.ts                    # TypeScript definitions
```

## Future Enhancements

Potential improvements for future iterations:

1. **Mobile App**: Native mobile experience
2. **Dark Mode**: Toggle for dark/light themes
3. **Customizable Dashboard**: Drag-and-drop layout
4. **Advanced Charts**: More technical indicators
5. **Notifications**: Push alerts for important events
6. **Export Data**: Download reports as PDF/CSV
7. **Multi-Language**: i18n support
8. **Real-time WebSocket**: Live updates without polling

## Development

### Running Locally
```bash
cd frontend
npm install
npm run dev
```

### Building for Production
```bash
npm run build
npm start
```

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile Safari (iOS 14+)
- Chrome Mobile (latest)

## Credits

Design inspired by:
- Alpha Arena trading competition platform
- Modern fintech dashboards
- Minimalist design principles

Built with ❤️ for ROMA Trading Platform

