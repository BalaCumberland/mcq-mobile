import React, { memo, useMemo, useCallback, useState } from 'react';
import { Text, Image } from 'react-native';
import { WebView } from 'react-native-webview';

interface LaTeXRendererProps {
  text?: string | null;
  style?: any;
  fontSize?: number;
}

const LATEX_SMILES_REGEX = /(\$\$(?:LATEX|SMILES)::[\s\S]*?::)/g;

const LaTeXRenderer: React.FC<LaTeXRendererProps> = memo(({ text, style, fontSize = 15 }) => {
  const [webViewHeights, setWebViewHeights] = useState<{ [key: number]: number }>({});

  const handleMessage = useCallback((index: number) => {
    return (event: any) => {
      const height = parseInt(event.nativeEvent.data, 10);
      if (!isNaN(height) && height > 0) {
        setWebViewHeights(prev => {
          if (prev[index] === height) return prev; // avoid unnecessary re-renders
          return { ...prev, [index]: height };
        });
      }
    };
  }, []);

  const isImageUrl = useCallback((str: string) => {
    return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(str);
  }, []);

  const renderContent = useMemo(() => {
    if (!text) return null;
    const parts = text.split(LATEX_SMILES_REGEX);

    return parts.map((part, index) => {
      if (!part) return null;

      // ---------- LATEX ----------
      if (part.startsWith('$$LATEX::') && part.endsWith('::')) {
        const latex = part.replace(/^\$\$LATEX::/, '').replace(/::$/, '').trim();
        const isBlock = latex.includes('\\\\') || latex.length > 40;
        const mathDelimiter = isBlock ? `\\[${latex}\\]` : `\\(${latex}\\)`;

        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <style>
                html, body {
                  margin: 0;
                  padding: 0;
                }
                #math-content {
                  margin: 0;
                  padding: 4px;
                  display: inline-block;
                  font-size: ${fontSize}px;
                  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  font-weight: 400;
                  line-height: 1.47;
                }
                .MathJax {
                  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
                }
                mjx-container {
                  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
                }
                mjx-container * {
                  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
                }
                mjx-math {
                  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
                }
                mjx-math * {
                  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
                }
              </style>
              <script>
                function sendHeight() {
                  var el = document.getElementById('math-content');
                  if (!el || !window.ReactNativeWebView) return;
                  var rect = el.getBoundingClientRect();
                  var height = Math.ceil(rect.height) + 4;
                  window.ReactNativeWebView.postMessage(String(height));
                }

                window.MathJax = {
                  tex: { inlineMath: [['\\\\(', '\\\\)']], displayMath: [['\\\\[', '\\\\]']] },
                  chtml: { 
                    scale: 0.88,
                    fontURL: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2',
                    adaptiveCSS: true
                  },
                  startup: {
                    ready: () => {
                      MathJax.startup.defaultReady();
                      MathJax.typesetPromise().then(() => {
                        // Force consistent font override after rendering
                        const style = document.createElement('style');
                        style.textContent = 'mjx-container, mjx-container *, mjx-math, mjx-math * { font-family: "SF Pro Text", -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important; font-weight: 400 !important; }';
                        document.head.appendChild(style);
                        
                        sendHeight();
                        setTimeout(sendHeight, 50);
                        setTimeout(sendHeight, 200);
                      });
                    }
                  }
                };
              </script>
              <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
            </head>
            <body>
              <div id="math-content">
                ${mathDelimiter}
              </div>
            </body>
          </html>
        `;

        return (
          <WebView
            key={`latex-${index}`}
            source={{ html }}
            originWhitelist={['*']}
            style={{
              width: '100%',
              height: webViewHeights[index] ?? (isBlock ? 60 : 40), // small initial
              backgroundColor: 'transparent',
            }}
            scrollEnabled={false}                  // we size it ourselves
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            androidLayerType="hardware"
            cacheEnabled
            incognito={false}
            thirdPartyCookiesEnabled={false}
            onMessage={handleMessage(index)}
          />
        );
      }

      // ---------- SMILES ----------
      if (part.startsWith('$$SMILES::') && part.endsWith('::')) {
        const smiles = part.replace(/^\$\$SMILES::/, '').replace(/::$/, '').trim();
        const smilesUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(
          smiles
        )}/PNG?image_size=300x200`;
        return (
          <Image
            key={`smiles-${index}`}
            source={{ uri: smilesUrl, cache: 'force-cache' as any }}
            style={{ width: 300, height: 200, resizeMode: 'contain', marginVertical: 8 }}
          />
        );
      }

      // ---------- plain image URL ----------
      if (isImageUrl(part.trim())) {
        return (
          <Image
            key={`image-${index}`}
            source={{ uri: part.trim(), cache: 'force-cache' as any }}
            style={{ width: 200, height: 150, resizeMode: 'contain', marginVertical: 8 }}
          />
        );
      }

      // ---------- plain text ----------
      return (
        <Text key={`text-${index}`} style={style}>
          {part}
        </Text>
      );
    });
  }, [text, style, webViewHeights, handleMessage, isImageUrl]);

  return <>{renderContent}</>;
});

export default LaTeXRenderer;
