# kankeizu-dsl-mcp

「かんけいず！（仮）」の演出DSL（相関図アニメーションエンジン用JSON）を、AIが安全に生成・検証できるようにするためのMCPサーバー。

## コンセプト

DSL は「見せるための形式」であると同時に「作るための形式」である。

文章はいくらでも「なんとなく」書ける。誰が今どこにいるのか、2人の関係がいつ・何がきっかけで変わったのかを厳密に決めなくても書き進められてしまう。DSL はそれを許さない。

- `groupHistory` を書こうとした瞬間、「この人物は、いつ、どこにいたか」を時刻付きで決めることになる
- `edges` を書けば、「この2人の関係は、いつ、何がきっかけで変わったか」を避けて通れない
- 整理し終えた時、それが自然と DSL の形になっている

プロットホールを潰しながら書く思考の道具でもある。

## 提供するツール

| ツール名 | 内容 |
|---|---|
| `get_authoring_guide` | DSLの文法・コツ・よくある失敗パターンのガイド(Markdown)を返す。生成前に一度読ませる |
| `validate_dsl` | DSL(JSON文字列 or オブジェクト)を検証し `{ valid, errors, warnings }` を返す。全問題を1回でまとめて返す |
| `get_known_values` | `node.icon` / `edge.history[].style` 等の既知値一覧を返す |
| `check_ambiguous_conflict_terms` | 「戦い」「けんか」等の曖昧な対立表現を検出し、確認質問または自動解決結果を返す |
| `get_world_config_template` | ストーリー全体の初期設定（worldConfig）のテンプレートと説明を返す |

## AIエージェント側のフロー

1. `get_authoring_guide` で文法を読み込む
2. ストーリー原案からDSLを生成する
3. `check_ambiguous_conflict_terms` で暴力表現の曖昧さを確認・解決する
4. `validate_dsl` に渡す
5. `errors` が空になるまで修正 → 再検証を繰り返す
6. 完成したDSLを `engine/kankeizu_engine.html` の「脚本を編集」パネルに貼り付けて確認する

## セットアップ

```bash
npm install
```

Node.js 18以上が必要。

## MCPクライアントへの登録

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

## エンジン側とのルール同期

`validator.js` のバリデーションルールは `engine/kankeizu_engine.html` 内のロジックと一致させること。エンジン側にルールを追加・変更した場合は `validator.js` にも同じ変更を反映する。

## 免責事項：画像・アイコン素材について

`node.icon` 等に利用者が用意した画像データを使うことは技術的に可能。本ライブラリは画像データの中身を審査・制限しない中立的なツールである。

**著作権で保護された素材を使用する場合、その適法性の確認および利用に伴う一切の責任は利用者に帰属する。**
