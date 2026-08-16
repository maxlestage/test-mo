import UIKit
import WebKit

/// WebView plein écran qui charge le build Morpho embarqué (www/ dans
/// le bundle). Si le build n'a pas été synchronisé, bascule sur
/// l'application déployée en ligne.
final class WebViewController: UIViewController, WKNavigationDelegate {
    private static let remoteURL = URL(string: "https://mo-grid-837c953ac1fd.herokuapp.com")!

    // #0f1117 — fond du thème sombre, évite un flash blanc au lancement.
    private static let background = UIColor(
        red: 0x0F / 255, green: 0x11 / 255, blue: 0x17 / 255, alpha: 1
    )

    private var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = Self.background

        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true

        webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = self
        webView.isOpaque = false
        webView.backgroundColor = Self.background
        webView.scrollView.backgroundColor = Self.background
        // L'app web gère elle-même l'encoche (viewport-fit=cover +
        // safe-area-inset) : la WebView occupe tout l'écran.
        webView.scrollView.contentInsetAdjustmentBehavior = .never

        view.addSubview(webView)
        webView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
        ])

        load()
    }

    private func load() {
        if let index = Bundle.main.url(
            forResource: "index", withExtension: "html", subdirectory: "www"
        ) {
            webView.loadFileURL(
                index, allowingReadAccessTo: index.deletingLastPathComponent()
            )
        } else {
            webView.load(URLRequest(url: Self.remoteURL))
        }
    }

    // Les liens externes (http/https hors bundle et hors app en ligne)
    // s'ouvrent dans Safari plutôt que dans la WebView.
    func webView(
        _ webView: WKWebView,
        decidePolicyFor navigationAction: WKNavigationAction,
        decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
    ) {
        guard let url = navigationAction.request.url,
              navigationAction.navigationType == .linkActivated,
              let scheme = url.scheme?.lowercased(),
              ["http", "https"].contains(scheme),
              url.host != Self.remoteURL.host
        else {
            decisionHandler(.allow)
            return
        }
        UIApplication.shared.open(url)
        decisionHandler(.cancel)
    }
}
