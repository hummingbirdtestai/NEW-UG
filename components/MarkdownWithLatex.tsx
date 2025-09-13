// components/MarkdownWithLatex.tsx
import React from "react";
import { View, Dimensions } from "react-native";
import RenderHtml from "react-native-render-html";
import katex from "katex";
import "katex/dist/katex.min.css"; // ✅ Works on Web, ignored in native

interface MarkdownWithLatexProps {
  content: string | null | undefined;
  markdownStyles?: any;
}

export default function MarkdownWithLatex({
  content,
  markdownStyles,
}: MarkdownWithLatexProps) {
  const { width } = Dimensions.get("window");

  const processContent = (text: string): string => {
    let processed = String(text || '');

    // Block math: $$ ... $$
    processed = processed.replace(/\$\$([^$]+)\$\$/gs, (_, math) => {
      return `<div style="text-align:center;margin:12px 0;">${katex.renderToString(
        math.trim(),
        { displayMode: true, throwOnError: false }
      )}</div>`;
    });

    // Inline math: $ ... $
    processed = processed.replace(/(?<!\$)\$([^\n$]+?)\$(?!\$)/g, (_, math) => {
      return `<span>${katex.renderToString(math.trim(), {
        displayMode: false,
        throwOnError: false,
      })}</span>`;
    });

    // Markdown
    processed = processed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    processed = processed.replace(/\*(.*?)\*/g, "<em>$1</em>");
    processed = processed.replace(/`(.*?)`/g, "<code>$1</code>");
    processed = processed.replace(/\n/g, "<br/>");

    return processed;
  };

  const htmlContent = processContent(content);

  const defaultStyles = {
    body: { color: "#f1f5f9", fontSize: 16, lineHeight: 24 },
    strong: { color: "#5eead4", fontWeight: "700" },
    em: { color: "#34d399", fontStyle: "italic" },
    code: {
      backgroundColor: "rgba(0,0,0,0.3)",
      color: "#fbbf24",
      paddingHorizontal: 6,
      borderRadius: 4,
      fontSize: 14,
      fontFamily: "monospace",
    },
  };

  return (
    <View>
      <RenderHtml
        contentWidth={width}
        source={{ html: htmlContent }}
        tagsStyles={{ ...defaultStyles, ...markdownStyles }}
      />
    </View>
  );
}
