# Provenance & Commercial Licensing Compliance (版权溯源与商用合规声明)

OmniGraph K12（万象学阶）从底层数据模型、知识图谱内容、参数化题库模板到自适应引擎代码，均严格遵循 **100% 允许商业化运营** 的分层开源合规原则构建：

## 1. 严格隔离的许可证红线（Clean-Room Guarantee）

- **零 `CC BY-NC` 数据或代码引用**：本项目**不包含、不复制、不衍生** `xiaoyang111222/cn-math-taxonomy`（`CC BY-NC 4.0`）中的任何 JSON 节点数据、边数据、静态题目文本、SVG 配图或源代码。
- **零 `AGPL-3.0` / `GPL` 传染性代码引用**：本项目所有前后端代码、参数化变式出题器、有理数/代数等价判分器、DAG 诊断引擎及 FSRS 间隔重复调度器均为全新原创 TypeScript 实现，仅依赖 `MIT` / `Apache-2.0` / `ISC` 许可的运行时库。

## 2. 方法学参照与开放标准署名

本项目在双层知识图谱建模（全球共享概念核 Canonical Micro-Topic DAG + 区域课标对齐层 Scoped Curriculum Alignments）的方法学上参照了以下商用友好开源项目与开放标准，特此致谢与署名：

| 参考来源 / 标准 | 参考范围 | 上游许可证 | 本项目使用方式 |
| :--- | :--- | :--- | :--- |
| [withmarbleapp/os-taxonomy](https://github.com/withmarbleapp/os-taxonomy) | 跨国微主题先修图（DAG）与 Scoped Alignment 设计方法学 | `ODbL-1.0` (DB) / `CC BY-SA 4.0` | 仅借鉴分层建模思想；本项目概念核节点、跨科桥接与多语文本均为独立原创编写 |
| [goralcao/china-skill-taxonomy](https://github.com/goralcao/china-skill-taxonomy) | 面向家长的掌握证据、餐桌检查提示与交互微课件设计理念 | `ODbL-1.0` / `CC BY-SA 4.0` / `MIT` | 仅借鉴产品结构设计，未导入其原始数据文件 |
| [seyen37/tw-taxonomy](https://github.com/seyen37/tw-taxonomy) | 108 课纲双代码对齐与三级差异化任务（基础/巩固/拔高）模型 | `CC BY 4.0` | 仅借鉴差异化分层结构设计 |
| [open-spaced-repetition/ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) | FSRS 公开数学公式（Difficulty / Stability / Retrievability） | `MIT` | 基于公开论文公式独立实现轻量 TypeScript 调度器 |
| 各国/地区官方课程标准代码 | 中（2022/2025 课标）、港（EDB/HKDSE）、台（108课纲）、新（MOE）、马（KSSR/KSSM）、日（学習指導要領コード）、韩（2022 성취기준）、英（UK NC/GCSE）、美（CCSS/NGSS） | 官方公开标准编号 | **仅记录标准标识符代码与原创一句话知识点概述（Codes-Only Policy）**，不转载受版权保护的课标全文或商业教材正文 |

## 3. 本仓库分层许可证

- **软件源代码（`src/`、`scripts/`、`tests/`）**：`MIT License`
- **自建全球概念核图谱与参数化母题模板**：项目方自有版权（可按需以 `ODbL-1.0` 或商业专有许可发布）
