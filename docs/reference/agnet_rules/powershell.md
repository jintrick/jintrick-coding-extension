# PowerShell 5.1 文字化け対策の極意 (Encoding Mastery)

Windows 10 標準の **Windows PowerShell 5.1** において、文字化け（Mojibake）や意図しない BOM（Byte Order Mark）の付与を防ぐための決定版ガイドである。本プロジェクトにおいて、ファイルI/Oを扱う際は**例外なく**本規約に従うこと。

## 1. 根本的な原因（なぜ文字化けするのか）

PowerShell 5.1 には、現代の標準（UTF-8 BOMなし）と相反する2つの厄介な仕様が存在する。

1. **デフォルトエンコーディングの罠**: `Get-Content` や `Set-Content` 等の標準コマンドレットは、エンコーディング指定を省略した場合、**システムのデフォルトANSIコードページ（日本語環境では Shift-JIS / Windows-31J）** を使用する。これにより、UTF-8で保存されたJSONやスクリプトを読み込むと文字化けが発生する。
2. **UTF-8 BOM強制の罠**: ならばと `-Encoding UTF8` を指定して `Out-File` や `Set-Content` を実行すると、PowerShell 5.1 は**強制的に UTF-8 BOM を付与**して保存する。BOM付きUTF-8は、Node.js、Python、一部のJSONパーサーなどでパースエラーを引き起こす原因となる。

## 2. 対策の極意: 標準コマンドレットの「使用禁止」

この問題を完全に回避する唯一の確実な方法は、PowerShellの標準I/Oコマンドレットを捨て、**背後にある .NET Framework のクラス（`[System.IO.File]`）を直接呼び出す**ことである。

### 🚫 禁止事項
以下のコマンドレットを使用したファイルの読み書きは**厳禁**とする。
- `Get-Content`
- `Set-Content`
- `Out-File`
- `Add-Content`

---

## 3. 具体的な実装パターン (.NET クラスの利用)

### ① UTF-8 (BOMなし) での完全読み込み
JSONファイルや設定ファイルなど、ファイル全体をメモリに読み込む場合。
```powershell
# 常にエンコーディングを明示する
$text = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
```

### ② UTF-8 (BOMなし) での完全書き込み
ファイルを上書き保存する場合。UTF-8 (BOMなし) を生成するには、専用のエンコーディングオブジェクトをインスタンス化する必要がある。
```powershell
# $false が「BOMを出力しない」というフラグ
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($filePath, $text, $utf8NoBom)
```

### ③ UTF-8 (BOMなし) での追記（ログ出力など）
ログファイルなどへ行を追加する場合。
```powershell
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
# 第2引数は String の配列である必要がある
[System.IO.File]::AppendAllLines($logFilePath, [string[]]$newLine, $utf8NoBom)
```

### ④ Shift-JIS ファイルの読み込み（レガシーシステム連携）
日本の業務システム（レゾナなど）が出力するCSV等はShift-JISであることが多い。
```powershell
$sjis = [System.Text.Encoding]::GetEncoding("shift_jis")
$text = [System.IO.File]::ReadAllText($filePath, $sjis)
```

### ⑤ 巨大ファイルの遅延評価読み込み（メモリ節約）
数GBのログやCSVを読む際、`ReadAllText` を使うとメモリが枯渇する（OutOfMemoryException）。標準の `Get-Content -TotalCount 5` の代替として、`ReadLines` と LINQ の `Take` を組み合わせて先頭N行だけを安全に読み込む。
```powershell
$sjis = [System.Text.Encoding]::GetEncoding("shift_jis")
# ファイルをロックせずに（あるいは最小限で）先頭5行だけをシーケンシャルに読む
$lines = [System.Linq.Enumerable]::Take([System.IO.File]::ReadLines($filePath, $sjis), 5)

foreach ($line in $lines) {
    # 処理
}
```

## 4. 結論
PowerShell 5.1 スクリプトを書く際は、「**ファイルに触るなら [System.IO.File]**」を合言葉とすること。これにより、環境依存の文字化けバグをアーキテクチャレベルで根絶できる。