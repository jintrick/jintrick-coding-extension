# PowerShell 規約

## 1. 文字コード (Encoding)
PowerShell 5.1 におけるファイル読み書き時の文字化け（デフォルトでShift-JISになる仕様）を完全に防ぐため、以下のルールを**例外なく**適用する。

### 禁止事項
- `Get-Content`, `Set-Content`, `Out-File`, `Add-Content` などの標準コマンドレットを使用したファイル読み書きは原則禁止とする。

### 推奨事項 (.NET クラスの利用)
常に `[System.IO.File]` と明示的な `[System.Text.Encoding]` を組み合わせて使用すること。

#### UTF-8 (BOMなし) での読み込み (JSON, PS1 など)
```powershell
$text = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
```

#### UTF-8 (BOMなし) での書き込み
```powershell
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($path, $text, $utf8NoBom)
[System.IO.File]::AppendAllLines($path, [string[]]$lines, $utf8NoBom)
```

#### Shift-JIS での読み込み (特定のCSVなど)
```powershell
$sjis = [System.Text.Encoding]::GetEncoding("shift_jis")
# 全行読み込み
$text = [System.IO.File]::ReadAllText($path, $sjis)
# 先頭の数行のみ読み込む場合 (メモリ節約)
$lines = [System.Linq.Enumerable]::Take([System.IO.File]::ReadLines($path, $sjis), 5)
```
