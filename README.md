# かんけいず！（仮）

Canvas ベースの**相関図アニメーションエンジン**。JSON 形式の DSL（Domain-Specific Language＝脚本）を読み込み、人物の関係変化をステップごとにアニメーションで再生する。DSL はすべて AI（Claude / Gemini 等）に生成させる想定で設計されている。

## 構成

```
engine/
  kankeizu_engine.html      エンジン本体（完全自己完結・外部依存なし）
mcp/
  server.js                 MCPサーバー本体
  validator.js              DSL検証ロジック
  authoring-guide.md        AI向け文法・コツガイド
  agent-prompt.md           BYO-AI へのシステムプロンプトと作業手順
  world-config.sample.json  ストーリー初期設定のサンプル
  package.json
examples/
  bastille_demo.html        バスティーユ襲撃デモ（エンジン＋DSL＋画像が1ファイルに完結）
  bastille_dsl_clean.json   同デモのDSL（画像なし・読みやすい版）
  bastille_sources.md       デモの史実出典一覧
```

## Example

**バスティーユ襲撃デモ**（フランス革命・1789年7月14日）

エンジン＋DSL＋画像が1ファイルに完結したデモ。ダウンロードしてブラウザで開くだけで動く。

👉 [bastille_demo.html をダウンロード](https://github.com/konohana-alt/kankeizu/releases/download/v1.0.0/bastille_demo.html)

## 最短体験

1. 上記リンクからデモをダウンロードし、ブラウザで開く → そのまま動く
2. `engine/kankeizu_engine.html` を開き、「脚本を編集」パネルに自分の DSL（脚本 JSON）を貼り付ける

## 新しい物語を作る（AI + MCP）

### Remote MCP（インストール不要・推奨）

Node.js 不要。Claude Desktop / Claude Code の設定に以下を追加するだけ：

```json
{
  "mcpServers": {
    "kankeizu-dsl": {
      "url": "https://nwkjo52kv6.execute-api.ap-northeast-1.amazonaws.com/prod/"
    }
  }
}
```

### ローカル MCP（Node.js 環境がある場合）

```bash
cd mcp
npm install
```

MCPクライアントの設定に追加：

```json
{
  "mcpServers": {
    "kankeizu-dsl": {
      "command": "node",
      "args": ["/absolute/path/to/mcp/server.js"]
    }
  }
}
```

どちらの方法でも `validate_dsl` 等のツールが使える。`agent-prompt.md` の手順に沿って AI に DSL（脚本）を生成させ、`engine/kankeizu_engine.html` の「脚本を編集」パネルに貼り付けて確認する。

## エンジンの主な機能

- DSL パネルからJSONを直接貼り付け・編集
- ✏️ 編集モード：ノード・グループをドラッグして位置調整、画像の差し替え
- 📍 座標ピッカー：DSL執筆時の座標確認
- 📤 公開：現在のDSLを焼き込んだ閲覧専用HTML（`_rel_YYYYMMDDHHMMSS.html`）を生成
- ダーク/ライトテーマ自動対応

## ライセンス

エンジン本体・MCPサーバーのコード：MIT

同梱のアイコン素材（OpenMoji）：[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)  
使用する場合はクレジット表記が必要（エンジン画面下部に表記あり）。
