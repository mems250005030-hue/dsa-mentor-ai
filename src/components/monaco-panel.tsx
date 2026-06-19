"use client";

import Editor from "@monaco-editor/react";

export function MonacoPanel({
  language,
  value,
  onChange
}: {
  language: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="editor-shell h-full min-h-[420px] overflow-hidden rounded-md border bg-[#0f172a]">
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        value={value}
        onChange={(next) => onChange(next ?? "")}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontLigatures: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on"
        }}
      />
    </div>
  );
}
