# OKX AI PRO V4 — Multi-Agent Council

Inspired by public ideas in TauricResearch/TradingAgents, but independently implemented for crypto and OKX. No source code is copied.

## Council roles
1. Technical Agent — trend, EMA, RSI, regime and volatility.
2. Flow Agent — order-book imbalance, spread and taker flow.
3. Derivatives Agent — funding, open interest and crowding context.
4. Risk Agent — independent veto; data freshness, evidence conflict, drawdown and execution safety.
5. Portfolio Manager — deterministic final gate; it cannot bypass Risk Agent.

## Why this split
LLM/research agents may generate hypotheses, but execution must remain deterministic, auditable and bounded. A malformed/uncertain AI output is REVIEW/WAIT, never an executable trade.

## Simulation stages
A. Browser paper ledger: public market data only, no credentials, spot-only, no shorting/leverage.
B. OKX Demo API: server-side credentials only, x-simulated-trading: 1, read+trade permissions, no withdrawal.
C. Live: disabled until explicit promotion after OOS/walk-forward, realistic costs/slippage, stress tests and a sustained demo observation period.

## Credential boundary
Never place OKX API key, secret or passphrase in index.html, GitHub source, browser localStorage, logs, issues or chat. The serverless adapter reads OKX_API_KEY, OKX_SECRET_KEY and OKX_PASSPHRASE only from deployment environment variables.

## Constitutional risk rules
- Long-term risk-adjusted capital growth, survival first.
- 4% warning / 6% defense / 8% hard risk target.
- Risk Brain has veto power.
- No loss-chasing or automatic leverage increase.
- No withdrawal permission.
- New signals remain observation-only until independently validated.
- Every promoted change must be explainable, auditable and reversible.
