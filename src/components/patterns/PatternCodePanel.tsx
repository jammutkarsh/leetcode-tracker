"use client";

import { memo } from "react";
import PatternCodeBlock from "@/components/patterns/PatternCodeBlock";

function PatternCodePanel({ patternTitle, templates }) {
  return (
    <div className="relative mb-4">
      <PatternCodeBlock patternTitle={patternTitle} templates={templates} />
    </div>
  );
}

export default memo(PatternCodePanel);
