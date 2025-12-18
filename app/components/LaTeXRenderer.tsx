import React, { memo, useMemo } from 'react';
import { WebView } from 'react-native-webview';

interface LaTeXRendererProps {
  text: string;
  style?: any;
}

const processContent = (str) => {
  if (!str) return '';
  return str.replace(/\$\$LATEX::(.*?)::/gs, (_, latex) => {
    const trimmed = latex.trim();
    return trimmed.includes("\\\\") || trimmed.length > 40
      ? `\\[${trimmed}\\]`
      : `\\(${trimmed}\\)`;
  });
};

const createHTML = (content) => `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script><script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script><script>window.MathJax={tex:{inlineMath:[['\\\\(','\\\\)']],displayMath:[['\\\\[','\\\\]']]},chtml:{scale:1.0}};</script><style>body{margin:0;padding:8px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:16px;line-height:1.4;background:transparent;}</style></head><body>${content}</body></html>`;

const LaTeXRenderer: React.FC<LaTeXRendererProps> = memo(({ text, style }) => {
  const processedContent = useMemo(() => processContent(text), [text]);
  const html = useMemo(() => createHTML(processedContent), [processedContent]);
  const estimatedHeight = useMemo(() => {
    const lines = processedContent.split('\n').length;
    const hasLatex = processedContent.includes('\\(') || processedContent.includes('\\[');
    return Math.max(50, Math.min(150, lines * 20 + (hasLatex ? 30 : 0)));
  }, [processedContent]);

  return (
    <WebView
      source={{ html }}
      style={[{ height: estimatedHeight, backgroundColor: 'transparent' }, style]}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      javaScriptEnabled={true}
    />
  );
});

export default LaTeXRenderer;