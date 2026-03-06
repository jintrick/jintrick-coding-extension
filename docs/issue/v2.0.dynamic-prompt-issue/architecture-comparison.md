# 調査報告：Claude Code と Gemini CLI のアーキテクチャ比較

本ドキュメントでは、Gemini CLI の標準仕様と、Claude Code から抽出した「動的プロンプト合成」の手法を対比し、本設計の根拠を定義する。

## 1. 静的モノリス vs. 動的モジュール (Monolith vs. Modular)
- **Gemini CLI (Standard)**: セッション開始時に `system.md` を一度だけ読み込み、それを全ターンで固定して使い回す「モノリス構造」。履歴が長くなると、初期の指示（規約）を忘れる傾向がある。
- **Claude Code**: 228 個の断片（Fragments）を状況に応じて JS 側でパズルし、毎ターン最適な指示を生成する「モジュール型」。トークン予算（Budget）を常に最適化できる。

## 2. 注入のタイミング (Just-in-Time Injection)
- **Gemini CLI (Standard)**: 指示は常に最初（メッセージ履歴の 0 番目）に置かれる。
- **Claude Code**: セッションの状態（計画中、実装中、エラー発生）に合わせて、**「システム・リマインダー (System Reminders)」** を履歴の末尾（ユーザー発言の直前）に割り込ませる。これにより、モデルの Attention（注意）をその瞬間のタスクに 100% 集中させる。

## 3. 内省（Inner Monologue）の制御
- **Gemini CLI (Standard)**: モデルが自身の思考プロセスを饒舌に語ることがある。
- **Claude Code**: 「内省を見せるな、最終的な成果物のみを提示せよ」という厳格な出力スタイル指示（`tone-and-style-concise-output-detailed.md`）により、ポエム（余計なテキスト）を排除している。

## 4. プロンプト内関数 (Function Interpellation)
- **Claude Code**: プロンプト内に `${IS_IN_TEAMMATE_CONTEXT_FN()}` のような JS 関数の戻り値を埋め込む仕組み。
- **本プロジェクトの対応**: Gemini CLI の **「Runtime Hooks (BeforeModel)」** を使うことで、同様の動的置換と履歴の書き換えを後付けで実現する。

## 5. Antigravity 連携
- **法典の共有**: 両ツールが `.agent/rules/*.md` を参照することで、IDE（Antigravity）とターミナル（Gemini CLI）で全く同じ規約を AI が遵守する「統一知性」を構築する。

---
*Status: Architecture Comparison Finalized.*
