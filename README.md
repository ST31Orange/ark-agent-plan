# ark-agent-plan

用 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）原生模型选择器直接调用**火山方舟 Agent Plan** 的插件。它只做一件事：把方舟的 provider 路由写进共享的 `llm-pi-ai` 适配器，模型目录按 **2026-11-21** 的 Agent Plan 实际可调用列表登记。

## 提供的路由

| Route ID | 用途 | Base URL | 凭据名 |
|---|---|---|---|
| `ark-agent-plan-cn` | Agent Plan（cn-beijing） | `https://ark.cn-beijing.volces.com/api/plan` | `ARK_AGENT_PLAN_CN_API_KEY` |
| `ark-coding-plan-cn` | Coding Plan（cn-beijing） | `https://ark.cn-beijing.volces.com/api/coding` | `ARK_CODING_PLAN_CN_API_KEY` |
| `ark-coding-plan-byteplus` | Coding Plan（BytePlus / 海外） | `https://ark.ap-southeast.bytepluses.com/api/coding` | `ARK_CODING_PLAN_BYTEPLUS_API_KEY` |
| `ark-cn` | 后付费 API（cn-beijing） | `https://ark.cn-beijing.volces.com/api/v3/compatible` | `ARK_CN_API_KEY` |
| `ark-byteplus` | 后付费 API 海外（BytePlus） | `https://ark.ap-southeast.bytepluses.com/api/v3/compatible` | `ARK_BYTEPLUS_API_KEY` |

走 Anthropic Messages 协议（`api: anthropic-messages`）；`baseURL` 故意不带 `/v1`，由 pi-ai 自己拼 `/v1/messages`。

## Agent Plan 模型清单（已实测）

13 个模型全部在 `POST /api/plan/v1/messages` 上验证过：请求可通、深度思考可用、函数调用可用；带图片输入时逐个确认过是否被端点接受。

| 模型 ID | 显示名 | 上下文 | 最大输出 | 图片输入 |
|---|---|---|---|---|
| `doubao-seed-2.1-pro` | Doubao Seed 2.1 Pro | 1M | 256K | ✅ |
| `doubao-seed-evolving` | Doubao Seed Evolving | 1M | 256K | ✅ |
| `doubao-seed-2.1-lite` | Doubao Seed 2.1 Lite | 1M | 256K | ✅ |
| `doubao-seed-2.0-mini` | Doubao Seed 2.0 Mini | 256K | 128K | ✅ |
| `deepseek-v4.1-flash` | DeepSeek V4.1 Flash | 1M | 384K | ✅ |
| `deepseek-v4.1-flash-economy` | DeepSeek V4.1 Flash Economy | 1M | 384K | ✅ |
| `deepseek-v4-pro` | DeepSeek V4 Pro | 1M | 384K | ✅ |
| `deepseek-v4-flash` | DeepSeek V4 Flash | 1M | 384K | ✅ |
| `glm-5.3` | GLM-5.3 | 1M | 128K | ❌ 仅文本 |
| `glm-5.3-flash` | GLM-5.3 Flash | 1M | 128K | ✅ |
| `kimi-k3.1-pro` | Kimi K3.1 Pro | 1M | 1M | ✅ |
| `kimi-k2.8-preview` | Kimi K2.8 Preview | 1M | 128K | ✅ |
| `kimi-k3` | Kimi K3（官方标注即将下线） | 1M | 128K | ✅ |

上下文窗口与最大输出取自方舟模型列表文档，并与端点的 `max_tokens` 校验结果相互印证（例如 `glm-5.3`、`kimi-k3`、`doubao-seed-2.0-mini` 的端点报错都明确写着 `expected a value <= 131072`）。

> Coding Plan 与后付费路由的模型清单没有用真实 Key 复测（手上只有 Agent Plan 的 Key），沿用既有的一批登记值。`config` 补丁会整块替换 `llm-pi-ai` 那一行的配置，所以五条路由必须一起声明。

## 安装与使用

1. 安装本目录为 bundle（在 DSH 里用「插件 › 添加插件」指向本地目录，或让 agent 用 `plugin_manager` 安装）。
2. 打开 **设置 › 模型**，选 `Ark Agent Plan`，粘贴 Agent Plan 的 API Key（DSH 会写进凭据 `ARK_AGENT_PLAN_CN_API_KEY`；也可以直接写进 `~/.dsh/.credentials.yaml` 的 `refs`）。
3. 回到对话，在模型选择器里挑 `Doubao Seed 2.1 Pro (Agent Plan)` 等条目即可。

如果你的 profile 里另有方舟插件也写了 `llm-pi-ai` 的 `providers`，注意补丁是按 bundle 顺序叠加的、后应用的整块覆盖前者，本插件必须排在后面才生效；或者干脆只保留本插件。

## 维护

模型换代时只需改 `cordis.patch.yml` 里 `ark-agent-plan-cn.models` 数组；`contextWindow` / `maxTokens` 按官方模型列表填。改完重启 DSH（替换已安装包的代码需要重启才会加载新的模块代际；本插件只有 YAML，HMR 会直接生效）。

## 校对方式

- 模型是否存在：对每个 id 发一次 `max_tokens: 1` 的最小请求，`404` 即不存在（`doubao-seed-2.1-turbo` 会 200 但实际被别名到 `doubao-seed-2-1-pro-260915`，所以没列进清单）。
- 最大输出：发 `max_tokens` 超限值，读回 400 里 `expected a value <= N`。
- 图片能力：发一张 32×32 PNG，`Model only support text input` 即纯文本模型。
- 工具调用：带一个 `get_weather` 工具发请求，确认返回 `stop_reason: tool_use` 与 `tool_use` 块。

## License

MIT。图标为本插件原创。
