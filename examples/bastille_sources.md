# バスティーユ襲撃デモ：出典一覧

`bastille_demo.html`（かんけいず！プロトタイプ）で使用した史実データの出典です。DSL内のナレーション・時刻・人物・場所の設定根拠として記録します。

## 使用した情報源

| # | 出典 | URL |
|---|---|---|
| 1 | Britannica「Storming of the Bastille」 | https://www.britannica.com/event/storming-of-the-Bastille |
| 2 | World History Encyclopedia「Storming of the Bastille」 | https://www.worldhistory.org/Storming_of_the_Bastille/ |
| 3 | History Skills「The Storming of the Bastille and the birth of Revolutionary France」 | https://www.historyskills.com/classroom/modern-history/storming-of-the-bastille/ |
| 4 | Alpha History「The fall of the Bastille」 | https://alphahistory.com/frenchrevolution/fall-of-the-bastille/ |
| 5 | Wikipedia「Storming of the Bastille」（infobox） | https://en.wikipedia.org/wiki/Storming_of_the_Bastille |
| 6 | HISTORY.com「French revolutionaries storm the Bastille」 | https://www.history.com/this-day-in-history/july-14/french-revolutionaries-storm-bastille |
| 7 | History Crunch「Storming of the Bastille: A Detailed Summary」 | https://www.historycrunch.com/storming-of-the-bastille.html |
| 8 | Wikipedia「Stanislas-Marie Maillard」 | https://en.wikipedia.org/wiki/Stanislas-Marie_Maillard |
| 9 | Getty Images（マイヤールが濠の板を渡り降伏条件を受け取った場面の絵画キャプション） | https://www.gettyimages.com/photos/stanislas-marie-maillard |

## 事実ごとの対応

| DSL上の記述 | 内容 | 出典 |
|---|---|---|
| 1789-07-12 の決起演説 | ネッケル罷免の報を受け、デムーランがパレ・ロワイヤルで群衆に決起を呼びかけた | 出典1（Britannica要約："Camille Desmoulins - A street-corner orator who stirred Parisians to resist royal troops"） |
| 1789-07-14 06:00 アンヴァリッド襲撃 | 群衆がアンヴァリッドを襲い、約3万丁の銃を奪取したが弾薬はほとんど無かった | 出典4（"made off with around 30,000 rifles but found little gunpowder"） |
| 1789-07-14 10:00 バスティーユ包囲開始 | 約900人の群衆がバスティーユ前に集結し、火薬と大砲の引き渡しを要求 | 出典1（"Nine hundred Parisians gathered outside the fortress that morning"） |
| 1789-07-14 12:30頃 交渉決裂・発砲 | 交渉が決裂し、中庭になだれ込んだ群衆に守備側が発砲、戦闘開始 | 出典1, 出典3 |
| 1789-07-14 15:00頃 ユラン・エリー合流 | 反乱を起こしたフランス衛兵が、ユランとエリーに率いられて合流。大砲を門に向けた | 出典2（"Close to 3 PM... Led by Pierre-Augustin Hulin"）、出典1（"Two veterans, Second Lieut. Jacob-Job Élie and Pierre-Augustin Hulin, brought organization... along with more guns and two cannons"） |
| 1789-07-14 16:30頃 火薬庫爆破の脅し | ド・ローネが火薬庫を爆破すると脅したが、部下に押しとどめられた | 出典2, 出典1 |
| 1789-07-14 17:00頃 マイヤールが降伏条件を受け取る | マイヤールが濠に渡した板を伝ってド・ローネの降伏条件を受け取った | 出典9（絵画キャプション："Stanislas Maillard bravely climbing on a plank over the dry moat... to accept from one of the soldiers Launay's capitulation"） |
| 1789-07-14 17:00頃 降伏 | 包囲された守備側の多くが発砲を拒み、ド・ローネは17時頃に降伏、跳ね橋を下ろさせた | 出典3（"around 5:00 p.m. de Launay surrendered"）、出典4（"surrendered the fortress at around five o'clock"） |
| 1789-07-14 18:00 解放・押収 | 群衆がなだれ込み、7人の囚人を解放し、火薬と大砲を押収 | 出典1, 出典6 |
| 1789-07-14 19:30頃 ド・ローネ処刑 | ド・ローネは市庁舎まで引きずられ、殴打の末に斬首。首は槍の先に掲げられた | 出典7（"He was horribly beaten by the mob and eventually beheaded. His head was then fixed on a pike"） |
| 人物：ド・ローネ、ユラン、マイヤール、エリー | バスティーユ攻防戦の指揮官として公式に記録されている人物 | 出典5（Wikipediaインフォボックス："Commanders and leaders: Pierre Hulin, Stanislas Maillard, Jacob Job Élie" / "Bernard-René Jourdan de Launay"） |
| 守備側の兵力（参考） | 82人のアンヴァリッド退役兵、32人のスイス人傭兵、大砲30門 | 出典5, 出典2 |

## 意図的な簡略化・近似

- **デムーランの演説時刻**：出典は「7月12日」という日付までは明確だが、正確な時刻は記録が見つからなかったため、`12:00`を仮の値として使用している。史実として厳密な時刻ではない。
- **デムーランのその後の足取り**：7月14日当日、デムーラン自身がどこにいたかを示す出典は見つからなかったため、DSL上は7月12日のパレ・ロワイヤル演説の後は移動させていない（`groupHistory`をそれ以降追加していない）。史実の記録に基づく描写ではなく、単なる省略。
- **守備側の兵士個人**：82人のアンヴァリッド退役兵・32人のスイス人傭兵は、今回のデモでは個別のノードとして表現していない（ド・ローネのみを代表として描いている）。人数規模の参考情報として記載するに留めた。

## 注意

各出典の文章はそのまま引用せず、日本語で要約・言い換えてDSLのナレーションに反映しています。詳細な記述や一次資料の原文が必要な場合は、上記URLから直接確認してください。
