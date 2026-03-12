
$ErrorActionPreference = 'SilentlyContinue'
try {
    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
    [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
    
    $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
    $xml.LoadXml('<toast><visual><binding template="ToastGeneric"><text>High Priority Test</text><text>This SHOULD bypass suppression and appear NOW</text></binding></visual></toast>')
    
    $appId = 'Microsoft.Windows.Explorer'
    $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
    
    # Set Priority to High to bypass 'User is busy' suppression
    [Windows.UI.Notifications.ToastNotificationPriority, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
    $toast.Priority = [Windows.UI.Notifications.ToastNotificationPriority]::High
    
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($appId).Show($toast)
    Write-Host "High Priority Toast Sent."
    [System.Threading.Thread]::Sleep(500)
} catch {
    Write-Error $_.Exception.Message
}
