import React, { memo, useMemo } from 'react';
import { Text, View, Dimensions, Image } from 'react-native';
import { WebView } from 'react-native-webview';

interface LaTeXRendererProps {
  text: string;
  style?: any;
}

const LaTeXRenderer: React.FC<LaTeXRendererProps> = memo(({ text, style }) => {
  const isImageUrl = (str: string) => {
    return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(str);
  };



  const renderContent = useMemo(() => {
    const parts = text.split(/(\$\$(?:LATEX|SMILES)::[^:]*::)/g);
    
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
                  chtml: { scale: 2.0 }
                };
              </script>
            </head>
            <body style="margin:0; padding:12px; font-size:20px;">
              $$${latex}$$
            </body>
          </html>
        `;
        return (
          <WebView
            key={index}
            source={{ html }}
            style={{ height: 100, backgroundColor: 'transparent' }}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          />
        );
      }
      if (part.startsWith('$$SMILES::') && part.endsWith('::')) {
        const smiles = part.replace(/^\$\$SMILES::/, '').replace(/::$/, '').trim();
        const smilesUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/PNG?image_size=300x200`;
        return (
          <Image
            key={index}
            source={{ uri: smilesUrl }}
            style={{ width: 300, height: 200, resizeMode: 'contain', marginVertical: 8 }}
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
  }, [text]);

  return <>{renderContent}</>;
});

export default LaTeXRenderer;
