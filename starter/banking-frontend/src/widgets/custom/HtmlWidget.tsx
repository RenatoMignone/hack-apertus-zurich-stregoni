/**
 * Free HTML/JS widget. The HTML is untrusted: it runs only in an iframe with sandbox="allow-scripts"
 * (no same-origin, so no access to our DOM, cookies or session, and no top navigation).
 * Never render it with innerHTML or dangerouslySetInnerHTML.
 */
export function HtmlWidget({ html, height = 300 }: { html: string; height?: number }) {
  return (
    <iframe
      title="Custom widget"
      srcDoc={html}
      sandbox="allow-scripts"
      style={{ width: "100%", height, border: 0, display: "block" }}
    />
  );
}
