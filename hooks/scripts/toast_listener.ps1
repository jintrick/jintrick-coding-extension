param($triggerPath, $exitPath, $appId, $title, $body)

# Helper to show toast from within this independent process
function Show-Toast($t, $b, $id) {
    try {
        [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
        [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
        $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
        $xml.LoadXml("<toast scenario='alarm'><visual><binding template='ToastGeneric'><text>$t</text><text>$b</text></binding></visual></toast>")
        $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
        $toast.Priority = [Windows.UI.Notifications.ToastNotificationPriority]::High
        [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($id).Show($toast)
    } catch {}
}

while($true) {
    # Exit if signaled
    if (Test-Path $exitPath) {
        Remove-Item $exitPath -ErrorAction SilentlyContinue
        break
    }

    # Play sound and show toast if triggered
    if (Test-Path $triggerPath) {
        [System.Media.SystemSounds]::Asterisk.Play()
        Show-Toast $title $body $appId
        Remove-Item $triggerPath -ErrorAction SilentlyContinue
    }

    Start-Sleep -Milliseconds 200
}
