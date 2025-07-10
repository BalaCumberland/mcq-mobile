import React from 'react';
import { Text, View, Dimensions, Image } from 'react-native';
import { WebView } from 'react-native-webview';

interface LaTeXRendererProps {
  text: string;
  style?: any;
}

const LaTeXRenderer: React.FC<LaTeXRendererProps> = ({ text, style }) => {
  const isImageUrl = (str: string) => {
    return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(str) || str.includes('youtube.com') || str.includes('youtu.be');
  };

  const renderContent = () => {
    const parts = text.split(/(\$\$LATEX::[^:]*::)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('$$LATEX::') && part.endsWith('::')) {
        const latex = part.replace(/^\$\$LATEX::/, '').replace(/::$/, '').trim();
        const html = `
          <html>
            <head>
              <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
              <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
              <script>
                window.MathJax = {
                  tex: { inlineMath: [['$', '$'], ['\\(', '\\)']] },
                  chtml: { scale: 1.2 }
                };
              </script>
            </head>
            <body style="margin:0; padding:8px; font-size:16px;">
              $$${latex}$$
            </body>
          </html>
        `;
        return (
          <WebView
            key={index}
            source={{ html }}
            style={{ height: 60, backgroundColor: 'transparent' }}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          />
        );
      }
      if (isImageUrl(part.trim())) {
        return (
          <Image
            key={index}
            source={{ uri: part.trim() }}
            style={{ width: 200, height: 150, resizeMode: 'contain', marginVertical: 8 }}
          />
        );
      }
      return part ? <Text key={index} style={style}>{part}</Text> : null;
    });
  };

  return <>{renderContent()}</>;
};

export default LaTeXRenderer;