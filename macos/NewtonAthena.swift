import AppKit
import WebKit

final class ExamWindow: NSWindow {
    override func keyDown(with event: NSEvent) {
        if styleMask.contains(.fullScreen) && event.keyCode == 53 { return }
        super.keyDown(with: event)
    }
}

final class AppDelegate: NSObject, NSApplicationDelegate, WKScriptMessageHandler, WKUIDelegate, NSWindowDelegate {
    private var window: ExamWindow!
    private var webView: WKWebView!

    func applicationDidFinishLaunching(_ notification: Notification) {
        let controller = WKUserContentController()
        controller.add(self, name: "native")
        controller.addUserScript(WKUserScript(source: """
            (() => {
              const pending = new Map(); let nextId = 0;
              window.__nativeResult = (id, ok, value) => {
                const item = pending.get(id); if (!item) return; pending.delete(id);
                ok ? item.resolve(value) : item.reject(new Error(value));
              };
              const call = (action, imageData) => new Promise((resolve, reject) => {
                const id = ++nextId; pending.set(id, {resolve, reject});
                window.webkit.messageHandlers.native.postMessage({id, action, imageData});
              });
              window.electronAPI = {
                requestFullScreen: () => call('fullScreen'),
                savePhoto: imageData => call('savePhoto', imageData)
              };
            })();
            """, injectionTime: .atDocumentStart, forMainFrameOnly: true))

        let config = WKWebViewConfiguration()
        config.userContentController = controller
        webView = WKWebView(frame: .zero, configuration: config)
        webView.uiDelegate = self
        window = ExamWindow(contentRect: NSRect(x: 0, y: 0, width: 1000, height: 760),
                            styleMask: [.titled, .closable, .miniaturizable, .resizable],
                            backing: .buffered, defer: false)
        window.title = "Newton Athena"
        window.center()
        window.contentView = webView
        window.delegate = self
        window.makeKeyAndOrderFront(nil)

        let page = Bundle.main.resourceURL!.appendingPathComponent("web/index.html")
        webView.loadFileURL(page, allowingReadAccessTo: page.deletingLastPathComponent())
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let body = message.body as? [String: Any],
              let id = body["id"] as? Int, let action = body["action"] as? String else { return }
        if action == "fullScreen" {
            let alert = NSAlert()
            alert.messageText = "Enter full-screen test mode?"
            alert.informativeText = "Escape will not exit full screen. Press Command-Q if you need to quit."
            alert.addButton(withTitle: "Enter Full Screen")
            alert.addButton(withTitle: "Cancel")
            let approved = alert.runModal() == .alertFirstButtonReturn
            if approved { window.toggleFullScreen(nil) }
            reply(id, success: true, value: approved ? "true" : "false")
        } else if action == "savePhoto", let image = body["imageData"] as? String,
                  let comma = image.firstIndex(of: ","), image.hasPrefix("data:image/jpeg;base64,") {
            let encoded = String(image[image.index(after: comma)...])
            guard let data = Data(base64Encoded: encoded) else { reply(id, success: false, value: "Invalid JPEG image data."); return }
            do {
                let folder = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
                    .appendingPathComponent("Newton Athena/photos", isDirectory: true)
                try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
                let filename = "newton-athena-\(Int(Date().timeIntervalSince1970 * 1000)).jpg"
                try data.write(to: folder.appendingPathComponent(filename))
                reply(id, success: true, value: "{\"filename\":\(json(filename))}")
            } catch { reply(id, success: false, value: json(error.localizedDescription)) }
        } else {
            reply(id, success: false, value: json("Invalid request."))
        }
    }

    private func reply(_ id: Int, success: Bool, value: String) {
        webView.evaluateJavaScript("window.__nativeResult(\(id), \(success), \(value));")
    }

    private func json(_ value: String) -> String {
        let data = try! JSONSerialization.data(withJSONObject: [value])
        let array = String(data: data, encoding: .utf8)!
        return String(array.dropFirst().dropLast())
    }

    func webView(_ webView: WKWebView, requestMediaCapturePermissionFor origin: WKSecurityOrigin,
                 initiatedByFrame frame: WKFrameInfo, type: WKMediaCaptureType,
                 decisionHandler: @escaping (WKPermissionDecision) -> Void) {
        decisionHandler(type == .camera ? .grant : .deny)
    }

    func applicationShouldTerminate(_ sender: NSApplication) -> NSApplication.TerminateReply {
        let alert = NSAlert()
        alert.messageText = "Quit Newton Athena?"
        alert.informativeText = "Your test session will be interrupted if you quit."
        alert.addButton(withTitle: "Quit Test")
        alert.addButton(withTitle: "Cancel")
        return alert.runModal() == .alertFirstButtonReturn ? .terminateNow : .terminateCancel
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.setActivationPolicy(.regular)
app.delegate = delegate
app.run()
