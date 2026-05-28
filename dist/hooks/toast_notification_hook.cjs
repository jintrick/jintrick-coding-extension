// hooks/scripts/toast_notification_hook.cjs
var fs = require("fs");
var path = require("path");
var os = require("os");
var { spawnSync } = require("child_process");
var cacheDir = os.tmpdir();
var debugLog = path.join(cacheDir, "gemini_cli_toast_debug.log");
function log(msg) {
  const time = (/* @__PURE__ */ new Date()).toISOString();
  try {
    fs.appendFileSync(debugLog, `[${time}] ${msg}
`, "utf8");
  } catch (e) {
  }
}
function sendAllow() {
  process.stdout.write(JSON.stringify({ decision: "allow" }) + "\n");
}
function processEvent(inputData) {
  const { hook_event_name, session_id, cwd, notification_type, tool_name } = inputData;
  if (!session_id || !cwd) {
    return sendAllow();
  }
  const lockFile = path.join(cacheDir, `gemini_cli_toast_${session_id}.lock`);
  const thresholdMs = parseInt(process.env.JINTRICK_TOAST_THRESHOLD_MS || "30000", 10);
  if (hook_event_name === "BeforeAgent") {
    try {
      fs.writeFileSync(lockFile, Date.now().toString(), "utf8");
      log(`Timer started: BeforeAgent (session: ${session_id})`);
    } catch (e) {
      log(`Failed to start timer: ${e.message}`);
    }
  } else if (hook_event_name === "AfterAgent") {
    if (fs.existsSync(lockFile)) {
      try {
        const startTimeStr = fs.readFileSync(lockFile, "utf8");
        const startTimeMs = parseInt(startTimeStr, 10);
        const now = Date.now();
        const durationMs = now - startTimeMs;
        if (durationMs >= thresholdMs) {
          log(`Task completed. Duration ${durationMs}ms >= Threshold ${thresholdMs}ms. Sending robust toast.`);
          const durationSec = (durationMs / 1e3).toFixed(1);
          showToast(cwd, `\u30BF\u30B9\u30AF\u5B8C\u4E86: \u5B9F\u884C\u6642\u9593 ${durationSec}s`, session_id);
        }
        fs.unlinkSync(lockFile);
        log(`Timer cleaned up: AfterAgent (session: ${session_id})`);
      } catch (e) {
        log(`AfterAgent logic failed: ${e.message}`);
      }
    }
  } else if (hook_event_name === "Notification") {
    if (notification_type === "ToolPermission") {
      log(`ToolPermission detected. Sending alert toast.`);
      showToast(cwd, "\u5B9F\u884C\u306E\u627F\u8A8D\u5F85\u3061\u3067\u3059", session_id);
    }
  } else if (hook_event_name === "BeforeTool") {
    if (tool_name === "ask_user") {
      log(`ask_user detected. Sending input wait toast.`);
      showToast(cwd, "\u5165\u529B\u3092\u5F85\u6A5F\u3057\u3066\u3044\u307E\u3059", session_id);
    }
  }
  sendAllow();
}
function showToast(cwd, message, session_id) {
  const projectName = path.basename(cwd);
  const title = `Gemini CLI: ${projectName}`;
  const body = message;
  if (process.platform === "win32") {
    const escapedTitle = title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const escapedBody = body.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    deliverWindowsToast(escapedTitle, escapedBody, session_id);
  } else if (process.platform === "linux") {
    deliverLinuxNotification(title, body);
  }
}
function deliverLinuxNotification(title, body) {
  try {
    spawnSync("notify-send", [title, body], { stdio: "ignore" });
    log(`Linux notification delivered via notify-send.`);
  } catch (e) {
    log(`Failed to deliver Linux notification: ${e.message}`);
  }
}
function deliverWindowsToast(title, body, session_id) {
  const appId = "Microsoft.Windows.Explorer";
  const psScript = `\uFEFF
$ErrorActionPreference = 'SilentlyContinue'
try {
    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
    [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
    [Windows.UI.Notifications.ToastNotificationPriority, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null

    $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
    $xml.LoadXml('<toast><visual><binding template="ToastGeneric"><text>${title}</text><text>${body}</text></binding></visual></toast>')
    
    $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
    $toast.Priority = [Windows.UI.Notifications.ToastNotificationPriority]::High
    
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('${appId}').Show($toast)
    # Ensure registration is processed by OS
    [System.Threading.Thread]::Sleep(500)
} catch {}
`;
  const tmpFile = path.join(cacheDir, `gemini_cli_toast_${session_id}.ps1`);
  try {
    fs.writeFileSync(tmpFile, psScript, "utf8");
    spawnSync("powershell.exe", [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      tmpFile
    ], { windowsHide: true });
    if (fs.existsSync(tmpFile)) {
      fs.unlinkSync(tmpFile);
    }
    log(`Toast delivered successfully (Sync/HighPriority).`);
  } catch (e) {
    log(`Failed to deliver toast: ${e.message}`);
  }
}
var chunks = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  chunks += chunk;
});
process.stdin.on("end", () => {
  try {
    if (!chunks) return sendAllow();
    const inputData = JSON.parse(chunks);
    processEvent(inputData);
  } catch (e) {
    sendAllow();
  }
});
