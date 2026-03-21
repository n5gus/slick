export const MOCK_TRADES = [
    { timestamp: "2025-01-18 02:14", headline: "Iran closes Strait of Hormuz to...", score: 0.94, action: "EXECUTED" },
    { timestamp: "2025-01-17 18:33", headline: "OPEC+ emergency session called...", score: 0.81, action: "NO TRADE" },
    { timestamp: "2025-01-16 09:11", headline: "Saudi ambassador recalled from...", score: 0.44, action: "NO TRADE" },
    { timestamp: "2025-01-15 14:22", headline: "Airstrikes documented near critical pipeline infrastructure...", score: 0.88, action: "EXECUTED" },
    { timestamp: "2025-01-15 11:00", headline: "Peace talks resume in Geneva with US delegation...", score: 0.12, action: "NO TRADE" }
];

export const MOCK_AGENT_STATUS = {
    sentinel: {
        status: "MONITORING",
        lastHeadline: "Iran closes Strait of Hormuz to...",
    },
    quant: {
        status: "LIVE",
        liquidity: 150000.00
    },
    orchestrator: {
        status: "ARMED",
        lastScore: 0.94
    }
};

export const MOCK_MARKET = {
    symbol: "xyz:BRENTOIL",
    funding_rate: "0.0050%",
    liquidity_available: 150000.00,
    liquidity_max: 500000.00,
    liquidations: 12000.00
};
