$file = "C:\Users\El Wahda\.gemini\antigravity\brain\008254d1-bbe9-4e21-9e6d-0a3e11993542\.system_generated\logs\transcript_full.jsonl"
$line = (Get-Content -Path $file)[31]
if ($line -match '(<header[\s\S]*?</header>)') {
    Write-Output $matches[1]
}
