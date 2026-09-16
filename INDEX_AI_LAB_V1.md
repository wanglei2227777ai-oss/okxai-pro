# Index AI Lab V1 — SPY / QQQ Intraday Research System

## Objective
Build a research-first intraday system for SPY and QQQ. The system does **not** assume or promise a fixed daily return. Its job is to discover whether a repeatable positive expectancy survives transaction costs, slippage, walk-forward testing, and different market regimes.

## Research universe
- SPY (S&P 500 ETF)
- QQQ (Nasdaq-100 ETF)
- Optional context only: VIX/VXN, ES/NQ overnight return, rates and scheduled US macro events.

## Strategy ensemble
### 1. Opening Range / Trend Continuation
- Build opening range from first 15–30 minutes.
- Require abnormal range/volume and trend alignment.
- Trade continuation only after confirmation; no blind breakout chasing.

### 2. Intraday Momentum
- Test whether early-session direction predicts later-session continuation.
- Use volatility and volume regimes as filters.
- Explicitly re-test out-of-sample because published intraday anomalies can decay.

### 3. VWAP Mean Reversion
- Only active in non-trending/mean-reverting regimes.
- Standardize distance from VWAP by intraday realized volatility.
- Disable when trend-strength or event-risk filters indicate directional conditions.

### 4. Event Regime
- CPI, FOMC, NFP, GDP, retail sales and other scheduled high-impact releases are a separate regime.
- No entry immediately before a scheduled release.
- Post-event strategies require spread/volatility normalization and confirmation.

## Regime engine
Every session is classified using only information available at that time:
- TREND
- RANGE
- HIGH_VOL_EVENT
- LOW_LIQUIDITY / NO_TRADE

Inputs include overnight gap, opening-range width, realized volatility, relative volume, VWAP slope, trend strength, and scheduled-event flags.

## Signal fusion
Each strategy outputs: direction {-1,0,+1}, confidence [0,1], stop distance, expected holding time, and reason code.

The ensemble never forces a trade. If expected edge after estimated costs is insufficient, output NO_TRADE.

## Risk engine — cannot be bypassed by AI
Research defaults, to be optimized only in walk-forward tests:
- risk per trade: 0.20% of equity
- daily loss stop: 0.60%
- max 3 losing trades/session
- no averaging down
- no martingale
- no automatic leverage escalation after losses
- flat by session close for the intraday book
- event blackout before high-impact releases
- reject stale data, abnormal spreads, missing bars or impossible prices

These are design limits, not a promise that realized drawdown will stay inside them.

## Backtest protocol
1. Minute bars; no look-ahead data.
2. Adjust for splits/dividends where applicable.
3. Explicit commissions + bid/ask/slippage model.
4. Train/validation/test separated chronologically.
5. Walk-forward windows; parameters selected only on past data.
6. Purge/embargo around overlapping labels where ML is used.
7. Report results by year and regime, not only one aggregate equity curve.
8. Stress transaction costs at 1x, 2x and 3x assumptions.
9. Monte Carlo resample trade sequence for drawdown uncertainty.
10. Compare against SPY/QQQ buy-and-hold and simple rule baselines.

## Acceptance gates
A candidate is rejected if it depends on one narrow period, collapses under modest cost increases, has materially worse out-of-sample behavior, or requires parameter precision that is implausibly fragile.

Promote to paper/shadow testing only when:
- positive out-of-sample expectancy after costs
- profit factor > 1 in multiple walk-forward windows
- no single year/regime explains most profits
- drawdown and tail loss remain within the research risk budget
- enough trades exist for meaningful inference

No strategy is promoted because it hits a target daily return in-sample.

## Core metrics
- CAGR / annualized return
- average daily return (including zero-trade days)
- annualized volatility
- Sharpe and Sortino
- max drawdown and recovery time
- profit factor
- win rate and payoff ratio
- expectancy per trade
- turnover and total costs
- exposure/time in market
- tail loss / worst day
- performance by year, month, regime, long/short, SPY/QQQ

## Daily research output
For each session the engine should record:
- regime
- eligible strategies
- trades / NO_TRADE
- gross P&L
- costs
- net P&L
- risk vetoes
- model confidence
- whether the result was inside or outside the historical confidence band

## Research target
Do not optimize for “1–2% every day.” The research question is whether the system can produce stable positive expectancy with controlled downside. A daily average such as 0.10–0.20% would be exceptional if it genuinely survived long out-of-sample testing, costs and live-like execution; it must be measured, never assumed.

## Evidence incorporated
- Peer-reviewed research has documented SPY intraday momentum, especially around higher-volatility/high-volume/news days, but later work also shows some intraday predictability can disappear out of sample. This is why V1 is regime-aware and walk-forward-first.
- Published SPY intraday momentum research has reported positive historical results net of modeled costs, but those historical results are hypotheses to reproduce independently, not expected future returns.
- Scheduled macro announcements materially alter SPY/QQQ intraday volatility, so event sessions are isolated rather than mixed with ordinary sessions.

## Deployment rule
V1 is a research engine specification. It must not send live orders. Brokerage execution is a separate gated component only after independent validation and explicit authorization.