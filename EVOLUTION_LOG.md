# OKX AI PRO — Evolution Log

## 2026-09-14 — V4 Multi-Agent Council + Simulation

### 新研究：TauricResearch/TradingAgents
- 吸收其“分析角色分工 → 风险审查 → Portfolio Manager 最终决策”的架构思想。
- 重点采用：角色隔离、结构化决策、Risk/Portfolio Manager 最终门控、决策日志、异常输出应进入 REVIEW/WAIT 而不是变成交易。
- 不复制第三方业务代码；本项目针对 OKX/加密市场独立实现。

### 实际晋级
- Technical Agent：趋势、EMA、RSI、价格结构、Regime。
- Flow Agent：20档盘口与主动成交 TFI。
- Derivatives Agent：Funding/OI 上下文；Funding 不简单映射方向。
- Risk Agent：数据陈旧、低置信度、跨 Agent 冲突时拥有独立 VETO。
- Portfolio Manager：Risk 通过后才给 BUY CANDIDATE / EXIT / WAIT。
- 新增浏览器纸上模拟账本：10,000 USDT 初始资金、现货、单次最多10%权益、无做空、无杠杆；高置信度多源确认后才模拟开仓，VETO/信号恶化/3%单笔止损触发退出。
- 新增 `api/okx-demo.js`：OKX Demo 私有 REST 的服务器端签名适配器，固定 `x-simulated-trading: 1`；支持健康检查、余额、持仓、挂单和受限现货 Demo 下单入口。
- API 凭证只允许部署环境变量；不得进入前端/GitHub/localStorage/聊天。
- 真钱实盘继续关闭。

### 当前边界
- GitHub Pages 只能运行静态前端；OKX Demo 私有签名必须部署到安全后端后才能真正连接模拟账户。
- 当前纸上模拟已经可运行，但它不是 OKX 官方 Demo 账户。
- 在完成 Demo 长期观察、OOS/walk-forward、费用滑点和压力测试之前，不晋级真钱实盘。

### 相关提交
- Demo adapter: `3f03265736b120cddc853edc5ed3b945b367df3d`
- V4 architecture: `09f4f6dccfe863d0819169a5b7bbdb0a0a97e9cb`
- V4 dashboard + paper simulation: `9dfe904f82e618eb3ce77338d3a77969c4cb9a21`

---

## 2026-09-14 — V3.1 数据韧性与成交订单流确认层

### 基线
- 起点：V3，提交 `cb10248eddcbb27d603288f2cdc6d8b3f10adca2`。
- 已有：K线、EMA20/EMA50、RSI14、20档盘口、Funding、实时 OI、4/6/8 回撤风控展示、Risk Brain 否决权、实盘关闭。

### 今日研究来源与吸收点
- **Freqtrade**：重点吸收 dry-run、lookahead-analysis、recursive-analysis 的验证思想。结论：回测漂亮不能直接晋级，必须防未来数据、递归指标偏差和回测/实时差异。
- **Hummingbot**：重点吸收 AI 决策与确定性执行分离、paper trading、执行器管理订单生命周期与风险边界的思想。
- **NautilusTrader**：重点吸收“研究/仿真/实盘尽量使用一致语义”和“实时执行仍存在传输、时序、持久化、对账差异”的工程思想。
- **OKX 官方 API**：继续使用公开行情、盘口、最近成交、资金费率、OI；不引入私钥和交易权限。
- **市场微观结构研究**：多层盘口/订单流失衡与短期价格形成有关；加密市场研究也提示成交订单流（trade flow imbalance）可能比静态盘口失衡更有解释力。
- **社区/短视频扫描**：社区反复强调滑点、延迟、低流动性和 paper/live 差异；抖音中“流动性/主力控盘”类内容缺乏可复现实证，因此只作为线索，不进入策略。关于马丁格尔/高收益 EA 风险的内容与本项目“禁止追损加杠杆”原则一致，但不作为独立策略证据。

### 候选改进与结论
1. **Data Guard（通过）**：辅助接口故障降级；核心 ticker/K线缺失或过期时 Risk Brain 直接否决。
2. **主动成交订单流 TFI（有限通过）**：只用于多源确认/冲突降置信度，未直接晋级为独立收益因子。
3. **Funding 作为简单方向因子（淘汰）**：仅作为拥挤度上下文。
4. **单次盘口快照直接推断庄家意图（淘汰）**。
5. **短视频/论坛策略直接入库（淘汰）**。

### V3.1 提交
- `a8af782b3ccd1386b5725225d994b2dd6ccb8a7a`
