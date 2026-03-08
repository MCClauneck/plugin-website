// Lightweight syntax highlighting for code blocks
(function() {
  const keywords = 'import|public|class|if|return|new|void|final|static|thenAccept|exceptionally|repositories|maven|mavenCentral|credentials|dependencies|implementation|url';
  const keywordRegex = new RegExp(`\\b(?:${keywords})\\b`);
  const pattern = /(\/\/.*$)|("[^"]*"|'[^']*')|(\b\d+L?\b)|(__KEYWORD__)|(\b[a-zA-Z_][\w]*)(?=\s*\()|((?!__KEYWORD__)\b[a-zA-Z_][\w]*\b)|(MCEconomyProvider|CurrencyType\.[A-Z_]+)/gm;
  const compiledPattern = new RegExp(pattern.source.replace(/__KEYWORD__/g, keywordRegex.source), pattern.flags);

  const escapeHtml = (str) => str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  function highlightXml(text) {
    const escaped = escapeHtml(text);
    const withTags = escaped.replace(/&lt;(\/?)([a-zA-Z0-9._:-]+)([^&]*?)&gt;/g, (_, slash, name, attrs) => {
      const highlightedAttrs = attrs.replace(/([a-zA-Z_:][\w:-]*)(=)(&quot;[^&]*?&quot;)/g, '<span class="token-variable">$1</span>$2<span class="token-string">$3</span>');
      return `&lt;${slash}<span class="token-keyword">${name}</span>${highlightedAttrs}&gt;`;
    });
    const withPlaceholders = withTags.replace(/(\$\{[^}]+\})/g, '<span class="token-variable">$1</span>');
    return withPlaceholders.replace(/(&gt;)([^<]+?)(?=&lt;)/g, (match, gt, content) => {
      return content.trim().length === 0 ? match : `${gt}<span class="token-string">${content}</span>`;
    });
  }

  function applyHighlight(codeEl) {
    if (codeEl.dataset.highlighted === 'true') return;
    const text = codeEl.textContent;
    compiledPattern.lastIndex = 0;
    const trimmed = text.trimStart();
    if (trimmed.startsWith('<')) {
      codeEl.innerHTML = highlightXml(text);
      codeEl.dataset.highlighted = 'true';
      compiledPattern.lastIndex = 0;
      return;
    }
    let result = '';
    let lastIndex = 0;

    let match;
    while ((match = compiledPattern.exec(text)) !== null) {
      const [full, comment, string, number, keyword, fn, variable, type] = match;
      result += escapeHtml(text.slice(lastIndex, match.index));

      const esc = escapeHtml(full);
      if (comment) result += `<span class="token-comment">${esc}</span>`;
      else if (string) result += `<span class="token-string">${esc}</span>`;
      else if (number) result += `<span class="token-number">${esc}</span>`;
      else if (keyword) result += `<span class="token-keyword">${esc}</span>`;
      else if (fn) result += `<span class="token-function">${esc}</span>`;
      else if (variable) result += `<span class="token-variable">${esc}</span>`;
      else if (type) result += `<span class="token-type">${esc}</span>`;
      else result += esc;

      lastIndex = compiledPattern.lastIndex;
    }

    result += escapeHtml(text.slice(lastIndex));
    codeEl.innerHTML = result;
    codeEl.dataset.highlighted = 'true';
    compiledPattern.lastIndex = 0;
  }

  function run() {
    const blocks = document.querySelectorAll('pre code');
    blocks.forEach(applyHighlight);
  }

  window.__hlRun = run;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
