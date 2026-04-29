"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { usePatternsLanguage } from "@/components/patterns/PatternsLanguageProvider";
import { Button } from "../ui/button";
import { Check, Copy } from "lucide-react";

const prismLanguageById = {
  python: "python",
  javascript: "javascript",
  java: "java",
  go: "go",
};

const codeBlockStyle = {
  margin: 0,
  borderRadius: "0.5rem",
  fontSize: "0.85rem",
  width: "100%",
  maxWidth: "100%",
};

function PatternCodeBlock({ patternTitle, templates }) {
  const { selectedLanguage, activeLanguage, hasRestoredLanguage } =
    usePatternsLanguage();
  const { isDark } = useTheme();
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [highlighterModule, setHighlighterModule] = useState(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || isVisible) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !hasRestoredLanguage || highlighterModule) {
      return;
    }

    let cancelled = false;

    Promise.all([
      import("react-syntax-highlighter"),
      import("react-syntax-highlighter/dist/esm/styles/prism"),
    ]).then(([highlighter, prismStyles]) => {
      if (cancelled) {
        return;
      }

      setHighlighterModule({
        Prism: highlighter.Prism,
        darkStyle: prismStyles.oneDark,
        lightStyle: prismStyles.oneLight,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [hasRestoredLanguage, highlighterModule, isVisible]);

  const code = useMemo(
    () => templates[selectedLanguage] || templates.python || "",
    [selectedLanguage, templates],
  );

  const prismLanguage = prismLanguageById[selectedLanguage] || "python";
  const Prism = highlighterModule?.Prism;

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        templates[selectedLanguage] || templates.python || "",
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        onClick={handleCopy}
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 z-10 h-7 gap-1.5 border border-border/70 bg-background/80 text-xs shadow-sm backdrop-blur-sm hover:bg-background"
      >
        {copied ? (
          <>
            <Check size={14} className="text-green-500" />
            <span className="text-green-500">Copied</span>
          </>
        ) : (
          <>
            <Copy size={14} />
            Copy
          </>
        )}
      </Button>
      {Prism && hasRestoredLanguage ? (
        <Prism
          language={prismLanguage}
          style={
            isDark ? highlighterModule.darkStyle : highlighterModule.lightStyle
          }
          wrapLongLines
          showLineNumbers={false}
          customStyle={codeBlockStyle}
          className="max-w-full rounded-lg border border-border bg-muted/50"
        >
          {code}
        </Prism>
      ) : (
        <pre
          aria-label={`${patternTitle} ${activeLanguage.name} template`}
          className="max-w-full overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-[0.85rem] text-foreground"
        >
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}

export default memo(PatternCodeBlock);
