# MahjongCloud｜分散式雲端運算的麻將聽牌機率分析

雲端運算期末專題。輸入一副 17 張的台灣麻將手牌，系統針對「打掉每一張牌」的選擇，各用 **Monte Carlo 模擬約 100 萬局**，回傳胡牌機率排名與 95% 信賴區間。

## 系統架構

模擬由 AWS 上的多台機器平行執行：

```
前端（S3 靜態網站）
  → API Gateway → Lambda Splitter → SQS（+ DLQ）
  → EC2 Worker（Auto Scaling Group）→ DynamoDB
  → Lambda Reducer → 結果
```

- **Splitter（Lambda）**：把 17 種「打哪張牌」的工作拆成任務丟進 SQS 佇列。
- **Worker（EC2 + Auto Scaling）**：多台機器同時從佇列取任務，各自跑 Monte Carlo 模擬，結果寫入 DynamoDB；失敗的任務進 DLQ 重試。
- **Reducer（Lambda）**：彙整各任務結果，算出每種打法的胡牌機率與信賴區間。

## 技術重點

| 項目 | 做法 |
|---|---|
| 平行運算 | SQS 分派任務 + EC2 Auto Scaling Group 水平擴充，依負載自動增減機器 |
| 容錯 | 佇列搭配 Dead Letter Queue，失敗任務自動重試 |
| 模擬核心 | 自製台灣麻將規則引擎與玩家 agents，`simulate()` 單局模擬 |
| 資料與驗收 | 50 個測試情境、契約測試（`pytest tests/test_contract.py`），可在本機用假模擬器跑完整流程 |

## 分工模組

| 模組 | 內容 |
|---|---|
| `mahjong_sim/` | 規則引擎與單局模擬 |
| `mahjong_sim/agents/` | 玩家策略 agents |
| `scenarios/` | 50 個測試情境 |
| `analysis/` | 實驗數據分析與畫圖 |
| `cloud/` | AWS 相關部署程式（boto3 腳本） |
