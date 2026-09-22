---
name: quality-review
description: このリポジトリ(React + Spring Boot)のバックエンド/フロントエンド実装を、デファクトスタンダードな作法から外れていないかという観点で品質チェックする。「品質チェックして」「標準的な実装になっているか見て」「lintと合わせてコードレビューして」等と頼まれたら使う。
---

# 品質チェック(デファクトスタンダード準拠レビュー)

このスキルは、このリポジトリの実装が **動くかどうか** ではなく、**React / Spring Bootの
標準的な作法から外れていないか** をチェックするためのチェックリストです。機能追加や
バグ修正のレビューとは別軸なので、`/code-review` とは併用してよい。

## 進め方

1. 対象範囲を確認する(`backend/src/main/java/com/example/trello` 全体か、直近の差分か)。
2. フロントは `cd trello-app && npm run lint` (oxlint) を実行する。0件でも、
   `.oxlintrc.json` の設定自体が薄くないか(react-hooks/exhaustive-deps相当が
   有効か等)を確認する。lintが本当に機能しているか疑わしい場合は、ダミーの
   未使用変数を仕込んで検知することを確認してから信用する。
3. バックエンドは自動lintツールが無いため、下記チェックリストを手動で確認する。
4. 見つけた指摘は「実際に動作確認して再現・検証してから」報告する(推測だけで
   報告しない)。curlでAPIを叩く、Playwrightでブラウザ操作を再現する、等。

## チェックリスト

### バックエンド(Spring Boot)
- [ ] `@RestControllerAdvice` / `@ExceptionHandler` が存在し、`EntityNotFoundException` 等の
      ドメイン例外が生の500ではなく適切なステータスコード(404等)にマッピングされているか
- [ ] `@PutMapping` は本当にリソース全体の置き換えか。「nullなら更新しない」部分更新
      (PATCH的セマンティクス)を`PUT`でやっていないか → 本来`@PatchMapping`にすべき
- [ ] Create系/Update系のDTOでバリデーション(`@Valid` + Bean Validation)の付与に
      一貫性があるか(Create にはついているが Update にはついていない、等がないか)
- [ ] 決まった値しか取らないフィールド(`sortMode`のような文字列)が、同じコードベース内の
      他のフィールド(`Priority`のようなenum)と型安全性のレベルが揃っているか
- [ ] `createdAt`/`deletedAt`等のタイムスタンプを手動で`Instant.now()`初期化していないか。
      Hibernateの`@CreationTimestamp`やSpring Data JPA Auditing(`@CreatedDate` +
      `@EnableJpaAuditing`)を使うのが定石
- [ ] Entity追加時、`ddl-auto=update`環境でPostgresの`NOT NULL`カラムをデフォルト値なしで
      追加していないか(既存行がある場合ALTER TABLEが失敗する。`columnDefinition`で
      defaultを指定する)
- [ ] service層のテストが存在するか(最低限、今回追加したエンドポイントの正常系/異常系)

### フロントエンド(React)
- [ ] `ErrorBoundary`が存在するか(存在しないとレンダー中の例外でアプリ全体が白紙化する)
- [ ] 楽観的更新(先にstateを更新→APIを呼ぶ)をしている箇所に、失敗時の
      エラー表示とロールバックがあるか。`await api.xxx()`が`try/catch`なしで
      呼びっぱなしになっていないか
- [ ] `res.json()`を呼ぶ前に、レスポンスが空ボディ(204等)でないか考慮されているか
      (200 OK・ボディなしを返すバックエンドAPIに対して`res.json()`すると例外になる)
- [ ] dnd-kit等のドラッグ&ドロップライブラリを使う場合、`PointerSensor`だけでなく
      `KeyboardSensor`(+`sortableKeyboardCoordinates`)が入っているか
      (アクセシビリティ対応が公式推奨)
- [ ] モーダル等、propで受け取った初期値から`useState`している箇所で、
      prop変化時の再同期(`key`指定 or `useEffect`)が必要なケースを見落としていないか
- [ ] フロントのテストが存在するか

## 対応方針

- 見つけた指摘は列挙するだけでなく、ユーザーに優先度と対応範囲(全部直すか、
  優先度の高いものだけか、1件ずつ確認しながら進めるか)を確認してから着手する。
- CLAUDE.mdのGit運用ルール(Issue作成→ブランチ作成→実装→PR)に従う。
  ただし「まとめて1つのIssue/PRで」等、ユーザーから明示的に指示があれば
  それに従う。
