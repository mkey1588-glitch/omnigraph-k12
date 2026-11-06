# OmniGraph K12（万象学阶）

**全球 9 地（中 · 日 · 韩 · 港 · 台 · 新 · 马 · 英 · 美）全科 K12 知识图谱教学网站、参数化防刷穿题库与「学生 · 教师 · 家长」三端个性化伴学平台**

## 核心架构亮点

1. **两层全球知识图谱架构（Global Canonical Core + 9-Region Curriculum Overlays）**
   - **底层概念核（`canonical_topics` + `topic_edges`）**：覆盖 **9 大学科**（数学、物理、化学、生物、英语、信息学、地理、历史、母语与思辨阅读）共 **50 个多学段微技能节点**与 **78 条有向无环图（DAG）先修边**（含 **25 条跨学科数学工具桥接边**）。
   - **上层 9 地课标映射层（`regional_alignments` · 450 条 100% 全覆盖）**：完整内置 `CN`（中国大陆）、`HK`（香港 HKDSE）、`TW`（台湾 108 课纲）、`SG`（新加坡 MOE Bar Model）、`MY`（马来西亚 KSSR/KSSM DLP）、`JP`（日本学习指导要领）、`KR`（韩国 2022 改订教育课程）、`UK`（英国 National Curriculum / GCSE）、`US`（美国 CCSS / NGSS / AP）官方标准代码、学段称谓、货币与双语符号体系。
2. **六大自适应、测评组卷与合规数据飞轮引擎**
   - **自适应前置回溯诊断引擎（`src/lib/engines/dag-engine.ts`）**：连对确认触发**祖先闭包剪枝（Ancestor Mastery Closure）**；首题受阻自动降维复测，精准区分「偶然粗心滑档（`shaky`）」与「概念薄弱（`weak`）」，沿先修与跨科边回溯锁定源头病灶（`weakRoots`）并更新 BKT 掌握概率 `pMastery`。
   - **参数化防背题母题生成、KaTeX 排版与富交互探索引擎（`src/lib/engines/item-generator.ts`、`MathText.tsx`、`InteractiveWidget.tsx`）**：覆盖 **50 类全科母题 × 3 档难度（150 个动态模板）**，内置 `KaTeX` 公式渲染（自动保护 `HK$`/`NT$`/`S$` 货币符号）、交互数轴探针、虚拟并联欧姆电学实验台与抛物线极值滑块。
   - **FSRS 间隔重复错题本与孪生变式清零引擎（`src/lib/engines/fsrs-engine.ts`）**：按遗忘曲线（难度 `D`、稳定性 `S`、保留率 `R`）调度复习，连续 3 次 `Good/Easy` 孪生变式清零晋级。
   - **AI 智能拍题/录错题归因与 9 地教材一键组 A/B 平行卷引擎（`src/lib/engines/smart-capture-and-paper.ts`）**：支持学生拍题/粘贴错题自动匹配 9 地课标节点与上游根因（`/capture`）；支持教师勾选章节一键生成防作弊平行 **A 卷 + B 卷 + 双向细目表 + 标准评分卷**（`/paper-builder`）。
   - **9 地未成年人 PII 物理脱敏盾（`src/lib/engines/privacy-shield.ts`）**：对齐 `PIPL / COPPA / UK-AADC / SG PDPA / APPI / PIPA`，在外部 AI 调用前自动剥离真实姓名、学校、电话、邮箱与证件号并写入合规审计日志（`privacy_audit_logs`）。
   - **校本图谱工坊与在线 Elo-IRT 2PL 数据飞轮（`src/lib/engines/irt-engine.ts`）**：支持校本先修边动态增删与实时 DAG 环路拦截、校本 `KaTeX` 题库自建，以及实测难度 $\beta$ 与区分度 $\alpha$ 动态校准看板（`/studio`）。
3. **学生 · 教师 · 家长三端全闭环工作台**
   - **学生端（`/`、`/explore`、`/diagnose`、`/capture`、`/wrong-book`）**：个人掌握度星海、交互微课件、靶向诊断舱、AI 录错题归因台、FSRS 错题孪生清零、6 位家庭 PIN 码免密登录与 `OMNI-9A` 邀请码入班。
   - **教师端（`/teacher`、`/paper-builder`、`/studio`）**：班级 × 微技能掌握度热力图、跨学科共性病灶雷达、三档分层作业派发、9 地教材一键组 A/B 卷与双向细目表、校本图谱工坊与 IRT 数据飞轮看板。
   - **家长端（`/parent`、`/parent/print`、`/auth`）**：多孩切换、创建低龄监护子账号（VPC 授权 + 家庭 PIN）、防沉迷每日时长契约与正向勋章签发（`P4`）、餐桌 3 分钟费曼提问卡、9 地跨境升学衔接对标与 A4 错题重练卷打印导出。

## 商业合规声明

本项目严格采用 **100% Clean-Room 净室研发路线**（详见 [`PROVENANCE.md`](./PROVENANCE.md)），代码以 `MIT` 协议组织，未复制或衍生任何 `CC BY-NC 4.0` 或 `AGPL-3.0` 限制性项目的数据、题库或代码，可直接作为商业化 SaaS 底座演进。

## 快速启动

```bash
# 1. 安装依赖
pnpm install

# 2. 校验全球概念核 DAG 无环性与 9 地课标覆盖完整性
pnpm validate:graph

# 3. 初始化并写入本地 SQLite 演示数据库 (data/omnigraph.db)
pnpm db:seed

# 4. 运行核心算法引擎单元测试
pnpm test:engines

# 5. 启动开发服务器 (http://localhost:3000)
pnpm dev
```
