# Index AI Lab — Live Readiness Contract

## Goal
Build a production-capable intraday research/execution system for SPY and QQQ. Profitability is never assumed: live capital is permitted only after validation gates pass.

## Instruments
- SPY
- QQQ
- Long/flat initially. Shorting is feature-gated until borrow/account permissions and separate validation pass.
- No options, futures, leveraged ETFs, martingale, averaging-down, or automatic leverage in V1.

## Architecture
market data -> feature engine -> regime classifier -> strategy ensemble -> risk engine -> order proposal -> broker adapter -> reconciliation -> audit log

The risk engine is deterministic and cannot be bypassed by an AI/LLM component.

## Strategy ensemble
1. Opening-range breakout with volume/volatility confirmation.
2. Intraday momentum/trend continuation.
3. VWAP pullback/mean reversion only in range regimes.
4. Event-day regime: CPI/FOMC/NFP and similar high-impact releases are separately classified; ordinary entries are suppressed around release windows.
5. NO_TRADE is a first-class output.

## Validation protocol
- Chronological train/validation/test split; never random-shuffle time series.
- Walk-forward optimization with parameters frozen before each out-of-sample segment.
- Include commissions/fees, spread and conservative slippage assumptions.
- Stress test costs at 1x/2x/3x baseline.
- Parameter perturbation test around chosen values.
- Bootstrap/Monte Carlo trade-sequence drawdown stress test.
- Report every tested variant, including failed variants, to reduce selection bias.

## Hard risk defaults
- Risk per trade: 0.20% NAV maximum.
- Daily realized+unrealized loss stop: 0.60% NAV.
- Three losing trades in a session: stop new entries.
- Portfolio gross exposure: <= 100% NAV in V1.
- Max one directional position per instrument.
- No adding to losing positions.
- No revenge sizing or loss-dependent size increases.
- Mandatory stale-data, spread, market-hours and duplicate-order checks.
- Broker/account state disagreement => kill switch and cancel new entries.
- Flatten before regular-session close unless an explicitly validated overnight strategy exists (none in V1).

## Live-capital gates
A live-capable adapter may exist, but `LIVE_TRADING=false` is the default. Capital deployment is blocked until ALL gates are satisfied:
1. Out-of-sample net return > 0 after modeled costs.
2. Positive expectancy and profit factor > 1 after 2x cost stress.
3. No single month/market regime explains the majority of total P&L.
4. Drawdown remains within the predefined risk budget under historical and Monte Carlo stress.
5. Paper/shadow execution demonstrates order-state reconciliation, reconnect handling, partial-fill handling, duplicate-order prevention and kill switch behavior.
6. Live credentials are stored server-side only, never committed or placed in browser code.
7. Explicit human activation is required for live mode after broker connection.

No minimum daily profit target is a gate. The system may stay flat.

## Broker adapters
Primary candidates: Alpaca Trading API or Interactive Brokers API. Both support automated US-equity trading. The final adapter depends on the account the owner is legally eligible and approved to use. Credentials are not required to build/test the core engine and must never be pasted into source control.

## Production failure handling
- Idempotent client order IDs.
- Persist every proposal, veto, submission, acknowledgement, partial fill, fill, cancel and rejection.
- Reconcile broker positions/orders on startup and reconnect.
- Heartbeat/watchdog for stale feeds and broker connectivity.
- Circuit breaker on data anomalies, repeated rejects, reconciliation mismatch or daily loss limit.
- Manual emergency stop must always override automation.

## Definition of done
“Done” does not mean a pretty dashboard. It means: reproducible backtests, frozen out-of-sample results, cost/stress tests, deterministic risk controls, broker adapter, order reconciliation, audit logs, deployment instructions and a live-mode lock that cannot be opened until validation gates pass.
