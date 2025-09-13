import React from 'react';
import { View, Text } from 'react-native';
import Markdown from 'react-native-markdown-display';
import MathView from 'react-native-math-view';

interface ContentSegment {
  type: 'text' | 'inline-math' | 'block-math';
  content: string;
}

interface UniversalContentRendererProps {
  content: string;
  style?: any; // Markdown styles object
  textStyle?: any; // Text component styles
  mathStyle?: any; // Math component styles
}

export default function UniversalContentRenderer({
  content,
  style,
  textStyle,
  mathStyle,
}: UniversalContentRendererProps) {
  // Parse content into segments (text, inline math, block math)
  const parseContent = (text: string): ContentSegment[] => {
    const segments: ContentSegment[] = [];
    let currentIndex = 0;

    // First, find all block math ($$...$$)
    const blockMathRegex = /\$\$(.*?)\$\$/gs;
    const blockMatches = Array.from(text.matchAll(blockMathRegex));
    
    // Then find all inline math ($...$) that are not part of block math
    const inlineMathRegex = /(?<!\$)\$([^$\n]+?)\$(?!\$)/g;
    
    // Create a map of all math positions to avoid conflicts
    const mathPositions = new Set<number>();
    
    // Mark block math positions
    blockMatches.forEach(match => {
      if (match.index !== undefined) {
        for (let i = match.index; i < match.index + match[0].length; i++) {
          mathPositions.add(i);
        }
      }
    });
    
    // Find inline math that doesn't conflict with block math
    const inlineMatches = Array.from(text.matchAll(inlineMathRegex)).filter(match => {
      if (match.index === undefined) return false;
      // Check if this inline match overlaps with any block math
      for (let i = match.index; i < match.index + match[0].length; i++) {
        if (mathPositions.has(i)) return false;
      }
      return true;
    });

    // Combine and sort all matches by position
    const allMatches = [
      ...blockMatches.map(match => ({ ...match, type: 'block' as const })),
      ...inlineMatches.map(match => ({ ...match, type: 'inline' as const }))
    ].sort((a, b) => (a.index || 0) - (b.index || 0));

    // Process segments
    allMatches.forEach(match => {
      if (match.index === undefined) return;

      // Add text before this match
      if (currentIndex < match.index) {
        const textContent = text.slice(currentIndex, match.index);
        if (textContent.trim()) {
          segments.push({
            type: 'text',
            content: textContent
          });
        }
      }

      // Add the math segment
      segments.push({
        type: match.type === 'block' ? 'block-math' : 'inline-math',
        content: match[1] // The content inside the $ or $$
      });

      currentIndex = match.index + match[0].length;
    });

    // Add remaining text
    if (currentIndex < text.length) {
      const remainingText = text.slice(currentIndex);
      if (remainingText.trim()) {
        segments.push({
          type: 'text',
          content: remainingText
        });
      }
    }

    // If no math found, return the entire content as text
    if (segments.length === 0) {
      segments.push({
        type: 'text',
        content: text
      });
    }

    return segments;
  };

  // Default markdown styles (can be overridden)
  const defaultMarkdownStyles = {
    body: {
      color: '#f1f5f9',
      backgroundColor: 'transparent',
      fontSize: 16,
      lineHeight: 24,
      margin: 0,
      fontFamily: 'System',
    },
    paragraph: {
      color: '#f1f5f9',
      marginBottom: 8,
      lineHeight: 24,
      fontSize: 16,
    },
    strong: {
      color: '#5eead4',
      fontWeight: '700',
      backgroundColor: 'rgba(94, 234, 212, 0.15)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    em: {
      color: '#34d399',
      fontStyle: 'italic',
      backgroundColor: 'transparent',
    },
    text: {
      color: '#f1f5f9',
      fontSize: 16,
      lineHeight: 24,
    },
    list_item: {
      color: '#f1f5f9',
      marginLeft: 16,
      marginBottom: 6,
      fontSize: 15,
    },
    bullet_list: {
      marginVertical: 8,
    },
    ordered_list: {
      marginVertical: 8,
    },
    code_inline: {
      backgroundColor: 'rgba(0,0,0,0.3)',
      color: '#fbbf24',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      fontSize: 14,
      fontFamily: 'monospace',
    },
    blockquote: {
      backgroundColor: 'rgba(0,0,0,0.2)',
      borderLeftWidth: 4,
      borderLeftColor: '#14b8a6',
      paddingLeft: 16,
      paddingVertical: 12,
      marginVertical: 12,
      borderRadius: 8,
    },
  };

  // Merge provided styles with defaults
  const markdownStyles = { ...defaultMarkdownStyles, ...style };

  // Default math styles
  const defaultMathStyle = {
    color: '#5eead4', // Teal color to match markdown strong text
    fontSize: 16,
  };

  const finalMathStyle = { ...defaultMathStyle, ...mathStyle };

  // Parse the content
  const segments = parseContent(content);

  // Render segments
  return (
    <View>
      {segments.map((segment, index) => {
        switch (segment.type) {
          case 'text':
            return (
              <Markdown key={index} style={markdownStyles}>
                {segment.content}
              </Markdown>
            );
          
          case 'inline-math':
            return (
              <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MathView
                  math={segment.content}
                  style={finalMathStyle}
                  resizeMode="contain"
                />
              </View>
            );
          
          case 'block-math':
            return (
              <View key={index} style={{ alignItems: 'center', marginVertical: 12 }}>
                <MathView
                  math={segment.content}
                  style={{ ...finalMathStyle, fontSize: (finalMathStyle.fontSize || 16) * 1.2 }}
                  resizeMode="contain"
                />
              </View>
            );
          
          default:
            return (
              <Text key={index} style={textStyle}>
                {segment.content}
              </Text>
            );
        }
      })}
    </View>
  );
}

// Example usage snippets:

/*
// 1. Flashcard Usage (Question + Answer)
<UniversalContentRenderer 
  content="What is the molecular formula for benzene? $C_6H_6$" 
  style={markdownStyles}
/>

<UniversalContentRenderer 
  content="The **energy-mass equivalence** is given by: $$E = mc^2$$ where $E$ is energy, $m$ is mass, and $c$ is the speed of light." 
  style={markdownStyles}
/>

// 2. MCQ Usage (stem, options, feedback)
<UniversalContentRenderer 
  content="Calculate the **molarity** of a solution containing $0.5$ moles of $NaCl$ in $250$ mL of water. The formula is: $$M = \frac{n}{V}$$" 
  style={markdownStyles}
/>

<UniversalContentRenderer 
  content="A) $2.0 \, M$" 
  style={markdownStyles}
/>

<UniversalContentRenderer 
  content="✅ Correct! Using the formula $M = \frac{n}{V} = \frac{0.5}{0.25} = 2.0 \, M$" 
  style={markdownStyles}
/>

// 3. ImageSearch/YouTubeSearch Usage (Search + Description)
<UniversalContentRenderer 
  content="Search for diagrams showing **benzene structure** with $C_6H_6$ molecular formula and aromatic ring representation" 
  style={markdownStyles}
/>

<UniversalContentRenderer 
  content="Visual explanation of **Einstein's equation** $E=mc^2$ with energy-mass relationship diagrams" 
  style={markdownStyles}
/>
*/