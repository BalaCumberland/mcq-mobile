import React from 'react';
import { Text, View } from 'react-native';

interface LaTeXRendererProps {
  text: string;
  style?: any;
}

const LaTeXRenderer: React.FC<LaTeXRendererProps> = ({ text, style }) => {
  const renderContent = () => {
    const parts = text.split(/(\$\$LATEX::[^:]*::)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('$$LATEX::') && part.endsWith('::')) {
        const latex = part.replace(/^\$\$LATEX::/, '').replace(/::$/, '').trim();
        return (
          <View key={index} style={{ backgroundColor: '#f0f0f0', padding: 8, marginVertical: 4, borderRadius: 4 }}>
            <Text style={[style, { fontFamily: 'monospace', fontSize: 14 }]}>{latex}</Text>
          </View>
        );
      }
      return part ? <Text key={index} style={style}>{part}</Text> : null;
    });
  };

  return <>{renderContent()}</>;
};

export default LaTeXRenderer;