#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { z } = require("zod");
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");

const {
  validateDsl,
  KNOWN_ICONS,
  KNOWN_STYLES,
  KNOWN_EFFECT_KINDS,
  findAmbiguousConflictTerms,
  validateWorldConfig,
} = require("./validator.js");

const AUTHORING_GUIDE = fs.readFileSync(
  path.join(__dirname, "authoring-guide.md"),
  "utf8"
);

const server = new McpServer({
  name: "kankeizu-dsl-mcp",
  version: "0.1.0",
});

// ---------------------------------------------------------------------------
// ツール1: validate_dsl
// AIが生成したDSL(JSON文字列 or オブジェクト)を検証し、全エラー・全警告を返す。
// throwして最初の1件で止まるのではなく、一括で返すことで、AIの自己修正ループを
// 1回で終わらせやすくしている。
// ---------------------------------------------------------------------------
server.registerTool(
  "validate_dsl",
  {
    title: "かんけいずDSLを検証する",
    description:
      "「かんけいず！（仮）」の演出DSL(JSON)を検証し、valid/errors/warningsを返す。" +
      "生成したDSLは必ずこのツールに通し、errorsが0件になるまで修正すること。",
    inputSchema: {
      dsl: z
        .union([z.string(), z.record(z.any())])
        .describe(
          "検証対象のDSL。JSON文字列、またはパース済みのJSONオブジェクトのどちらでも良い。"
        ),
    },
  },
  async ({ dsl }) => {
    let parsed;
    if (typeof dsl === "string") {
      try {
        parsed = JSON.parse(dsl);
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  valid: false,
                  errors: ["DSLの文字列をJSONとしてパースできませんでした: " + e.message],
                  warnings: [],
                },
                null,
                2
              ),
            },
          ],
        };
      }
    } else {
      parsed = dsl;
    }

    const result = validateDsl(parsed);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

// ---------------------------------------------------------------------------
// ツール2: get_authoring_guide
// DSLの文法・作成のコツをまとめたガイドを返す。生成の前に一度読ませる想定。
// ---------------------------------------------------------------------------
server.registerTool(
  "get_authoring_guide",
  {
    title: "かんけいずDSL作成ガイドを取得する",
    description:
      "「かんけいず！（仮）」の演出DSLを生成する前に読むべき、文法とよくある失敗パターンのガイド(Markdown)を返す。",
    inputSchema: {},
  },
  async () => {
    return {
      content: [{ type: "text", text: AUTHORING_GUIDE }],
    };
  }
);

// ---------------------------------------------------------------------------
// ツール3: get_known_values
// icon / style の既知の値一覧。バリデーターの警告とも整合させたリファレンス。
// ---------------------------------------------------------------------------
server.registerTool(
  "get_known_values",
  {
    title: "既知のicon/style/soundEffect一覧を取得する",
    description:
      "node.icon、edge.history[].style、timeline[].soundEffect として現在サポートされている" +
      "既知の値の一覧を返す。リスト外の値はエラーにはならないが、フォールバック表示になる。",
    inputSchema: {},
  },
  async () => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { icons: KNOWN_ICONS, styles: KNOWN_STYLES, soundEffectKinds: KNOWN_EFFECT_KINDS },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ---------------------------------------------------------------------------
// ツール4: check_ambiguous_conflict_terms
// 「戦い」「けんか」「ファイト」のような、物理的暴力かどうかさえ特定しない言葉を
// narrativeから検出し、依頼者にそのまま提示できる選択式の確認質問を返す。
// AIはこれを見て自分で解釈を確定させてはいけない。見つかった質問はすべて依頼者に
// 選んでもらい、その回答をもとにsoundEffectを確定させてから最終出力すること。
// ---------------------------------------------------------------------------
server.registerTool(
  "check_ambiguous_conflict_terms",
  {
    title: "曖昧な対立表現を検出し、確認すべき質問（または自動解決の結果）を取得する",
    description:
      "DSLのtimeline全体から、「戦い」「けんか」「ファイト」等、物理的暴力かどうかさえ" +
      "特定しない曖昧な対立表現を検出する。判定は3段階：(1) 物語中に特定の武器" +
      "（銃・刀・大砲等）が明文化されていれば、それが正解。worldConfigより優先し忠実に" +
      "従う（autoResolved:true, resolvedBy:'explicitInStory'）。(2) 死傷等はあるが" +
      "手段が不明なら、autoResolved:false とし、返された選択式の質問をそのまま依頼者に" +
      "提示して確認する（AIが勝手に解釈しない）。(3) 深刻化の兆候が無ければ、worldConfig" +
      "（ストーリー側の初期設定。get_world_config_template参照。あれば）またはデフォルトを" +
      "適用する（autoResolved:true）。worldConfigは「上限」ではなく「何も書かれていない" +
      "時の初期設定」である点に注意——物語の展開で明文化された内容を上書きしない。" +
      "DSLを最終出力する前に必ず呼ぶこと。",
    inputSchema: {
      dsl: z
        .union([z.string(), z.record(z.any())])
        .describe(
          "検査対象のDSL。JSON文字列、またはパース済みのJSONオブジェクトのどちらでも良い。"
        ),
      worldConfig: z
        .union([z.string(), z.record(z.any())])
        .optional()
        .describe(
          "省略可。あらかじめ聞き取り済みのストーリー全体のポリシー（get_world_config_templateの" +
          "テンプレート参照）。渡すと、以後の対立表現はすべて質問せず自動解決される。" +
          "JSON文字列、またはパース済みのオブジェクトのどちらでも良い。"
        ),
    },
  },
  async ({ dsl, worldConfig }) => {
    let parsed;
    if (typeof dsl === "string") {
      try {
        parsed = JSON.parse(dsl);
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { findings: [], error: "DSLの文字列をJSONとしてパースできませんでした: " + e.message },
                null,
                2
              ),
            },
          ],
        };
      }
    } else {
      parsed = dsl;
    }

    let parsedConfig;
    if (worldConfig != null) {
      if (typeof worldConfig === "string") {
        try {
          parsedConfig = JSON.parse(worldConfig);
        } catch (e) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  { findings: [], error: "worldConfigの文字列をJSONとしてパースできませんでした: " + e.message },
                  null,
                  2
                ),
              },
            ],
          };
        }
      } else {
        parsedConfig = worldConfig;
      }
      const configCheck = validateWorldConfig(parsedConfig);
      if (!configCheck.valid) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                { findings: [], error: "worldConfigが不正です: " + configCheck.errors.join(" / ") },
                null,
                2
              ),
            },
          ],
        };
      }
    }

    const findings = findAmbiguousConflictTerms(parsed, parsedConfig);
    return {
      content: [{ type: "text", text: JSON.stringify({ findings }, null, 2) }],
    };
  }
);

// ---------------------------------------------------------------------------
// ツール5: get_world_config_template
// worldConfig（ストーリー全体の初期設定）のテンプレートと、各フィールドの説明を返す。
// ストーリーを作り始める際、最初に一度だけ聞き取りを行い、その結果をこのテンプレートに沿った
// JSONファイルとして保存しておけば、以降は check_ambiguous_conflict_terms にそのまま
// 渡すだけで、対立表現が常に自動解決されるようになる（対話中に毎回質問しなくて済む）。
// 重要：violenceLevelは「上限（キャップ）」ではなく「何も書かれていない時の初期設定」。
// 物語の展開で暴力の種類が明文化されれば、そちらが優先される。
// ---------------------------------------------------------------------------
server.registerTool(
  "get_world_config_template",
  {
    title: "worldConfig（ストーリー初期設定）のテンプレートを取得する",
    description:
      "ストーリー全体の初期設定（worldConfig）のテンプレートと、各フィールドの" +
      "説明・選択肢を返す。ストーリーを作り始める時、最初に一度だけこの内容に基づいて依頼者に" +
      "聞き取りを行い、回答をJSONファイルとして保存しておくこと。以後はそのファイルを" +
      "check_ambiguous_conflict_terms の worldConfig 引数に渡せば、対立表現の解釈は" +
      "（物語に何も明文化されていない場合に限り）常に自動で決まり、対話のたびに質問する" +
      "必要がなくなる。violenceLevelは上限ではなく初期設定であり、物語中に特定の武器が" +
      "明文化されれば、そちらが優先されて忠実に反映される（worldConfigでは止められない）。",
    inputSchema: {},
  },
  async () => {
    const template = {
      worldName: "",
      violenceLevel: "unarmed",
      maxIntensity: "heavy",
      defaultIntensity: "medium",
      defaultEdgeColor: "default",
      defaultEdgeWeight: "normal",
      allowedKinds: null,
      notes: "",
    };
    const fields = {
      worldName: "ストーリー名・作品名（自由記述）",
      violenceLevel: "none | unarmed | bladed | firearms | any。曖昧な対立表現に何も明文化されていない場合の初期設定（上限ではない）。物語中に特定の武器が明文化されれば、この設定より優先される",
      maxIntensity: "light | medium | heavy。物語に何も明文化されていない場合の強度の上限",
      defaultIntensity: "light | medium | heavy。曖昧な対立表現の既定強度。省略時は light（疑わしきはライトに）",
      defaultEdgeColor: "default | red | blue | green | gold | purple | pink | gray。関係線のcolor未指定時のデフォルト色。省略時は default（インク色）",
      defaultEdgeWeight: "normal | thick。関係線のweight未指定時のデフォルト太さ。省略時は normal",
      allowedKinds: "省略可。[\"argument\",\"punch\",\"clash\"] のような配列。質問時の対立種類の選択肢をこの範囲に絞る。省略時は全種類を提示",
      notes: "省略可。自由記述のメモ",
    };
    const example = {
      worldName: "剣と魔法の冒険譚",
      violenceLevel: "bladed",
      maxIntensity: "heavy",
      defaultIntensity: "medium",
      defaultEdgeColor: "blue",
      defaultEdgeWeight: "normal",
      allowedKinds: ["argument", "punch", "clash"],
      notes: "銃器は登場しない世界観。魔法・同盟関係の線は青で統一。",
    };
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ template, fields, example }, null, 2),
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("kankeizu-dsl-mcp: stdio上で待機中です");
}

main().catch((err) => {
  console.error("kankeizu-dsl-mcp: 起動に失敗しました", err);
  process.exit(1);
});
