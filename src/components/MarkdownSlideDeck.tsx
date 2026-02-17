import { isValidElement, useState, type ComponentProps, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils";

function splitMarkdownTableRow(row: string): string[] {
  const trimmed = row.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => cell.trim());
}

function parseMarkdownTable(markdown: string): { headers: string[]; aligns: Array<"left" | "center" | "right">; rows: string[][] } | null {
  const lines = markdown
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2 || !lines[0].includes("|")) {
    return null;
  }

  const headers = splitMarkdownTableRow(lines[0]);
  const separator = splitMarkdownTableRow(lines[1]);

  if (
    headers.length === 0 ||
    separator.length !== headers.length ||
    !separator.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s+/g, "")))
  ) {
    return null;
  }

  const aligns = separator.map((cell) => {
    const normalized = cell.replace(/\s+/g, "");
    if (normalized.startsWith(":") && normalized.endsWith(":")) return "center";
    if (normalized.endsWith(":")) return "right";
    return "left";
  });

  const rows = lines.slice(2).map(splitMarkdownTableRow).filter((row) => row.length === headers.length);
  return { headers, aligns, rows };
}

function flattenTextNode(node: ReactNode): string | null {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) {
    let output = "";
    for (const child of node) {
      const value = flattenTextNode(child);
      if (value === null) return null;
      output += value;
    }
    return output;
  }
  if (isValidElement(node) && node.type === "br") {
    return "\n";
  }
  return null;
}

const markdownComponents = {
  h1: ({ className, ...props }: ComponentProps<"h1">) => (
    <h1 className={cn("scroll-m-20 text-4xl font-extrabold tracking-tight text-balance", className)} {...props} />
  ),
  h2: ({ className, ...props }: ComponentProps<"h2">) => (
    <h2
      className={cn("scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0", className)}
      {...props}
    />
  ),
  h3: ({ className, ...props }: ComponentProps<"h3">) => (
    <h3 className={cn("scroll-m-20 text-2xl font-semibold tracking-tight", className)} {...props} />
  ),
  h4: ({ className, ...props }: ComponentProps<"h4">) => (
    <h4 className={cn("scroll-m-20 text-xl font-semibold tracking-tight", className)} {...props} />
  ),
  p: ({ className, children, ...props }: ComponentProps<"p">) => {
    const flat = flattenTextNode(children);
    const table = flat ? parseMarkdownTable(flat) : null;

    if (table) {
      return (
        <div className="my-6 w-full overflow-x-auto">
          <table className="w-full overflow-y-auto">
            <thead className="[&_tr]:border-b">
              <tr className="m-0 border-t p-0 even:bg-muted">
                {table.headers.map((header, index) => (
                  <th
                    key={`${header}-${index}`}
                    className="border px-4 py-2 text-left font-bold"
                    style={{ textAlign: table.aligns[index] }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {table.rows.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`} className="m-0 border-t p-0 even:bg-muted">
                  {row.map((cell, cellIndex) => (
                    <td
                      key={`cell-${rowIndex}-${cellIndex}`}
                      className="border px-4 py-2 text-left"
                      style={{ textAlign: table.aligns[cellIndex] }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <p className={cn("leading-7 [&:not(:first-child)]:mt-6", className)} {...props}>
        {children}
      </p>
    );
  },
  a: ({ className, ...props }: ComponentProps<"a">) => (
    <a className={cn("font-medium text-primary underline underline-offset-4", className)} {...props} />
  ),
  blockquote: ({ className, ...props }: ComponentProps<"blockquote">) => (
    <blockquote className={cn("mt-6 border-l-2 pl-6 italic", className)} {...props} />
  ),
  ul: ({ className, ...props }: ComponentProps<"ul">) => (
    <ul className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)} {...props} />
  ),
  ol: ({ className, ...props }: ComponentProps<"ol">) => (
    <ol className={cn("my-6 ml-6 list-decimal [&>li]:mt-2", className)} {...props} />
  ),
  li: ({ className, ...props }: ComponentProps<"li">) => (
    <li className={cn("leading-7", className)} {...props} />
  ),
  code: ({ className, ...props }: ComponentProps<"code">) => (
    <code
      className={cn("relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold", className)}
      {...props}
    />
  ),
  pre: ({ className, ...props }: ComponentProps<"pre">) => (
    <pre className={cn("mt-6 mb-4 overflow-x-auto rounded-lg border bg-muted p-4", className)} {...props} />
  ),
  table: ({ className, ...props }: ComponentProps<"table">) => (
    <table className={cn("my-6 w-full border-collapse overflow-x-auto", className)} {...props} />
  ),
  thead: ({ className, ...props }: ComponentProps<"thead">) => (
    <thead className={cn("[&_tr]:border-b", className)} {...props} />
  ),
  tbody: ({ className, ...props }: ComponentProps<"tbody">) => (
    <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  ),
  tr: ({ className, ...props }: ComponentProps<"tr">) => (
    <tr className={cn("m-0 border-t p-0 even:bg-muted", className)} {...props} />
  ),
  th: ({ className, ...props }: ComponentProps<"th">) => (
    <th
      className={cn(
        "border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: ComponentProps<"td">) => (
    <td
      className={cn("border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right", className)}
      {...props}
    />
  ),
  hr: ({ className, ...props }: ComponentProps<"hr">) => (
    <hr className={cn("my-4 md:my-8", className)} {...props} />
  ),
} as const;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function extractTitleAndBody(markdown: string): { title: string; body: string } {
  const lines = markdown.split("\n");
  const h1Index = lines.findIndex((line) => /^\s*#\s+/.test(line));

  if (h1Index === -1) {
    return { title: "", body: markdown };
  }

  const title = lines[h1Index].replace(/^\s*#\s+/, "").trim();
  const bodyLines = lines.filter((_, index) => index !== h1Index);

  return { title, body: bodyLines.join("\n").trimStart() };
}

type MarkdownSlideDeckProps = {
  slides: string[];
  loading?: boolean;
};

export default function MarkdownSlideDeck({ slides, loading = false }: MarkdownSlideDeckProps) {
  const [idx, setIdx] = useState(0);
  const total = slides.length;

  const safeIdx = clamp(idx, 0, Math.max(total - 1, 0));
  const currentSlide = slides[safeIdx] || "";
  const { title: slideTitle, body: slideBody } = extractTitleAndBody(currentSlide);

  const goPrev = () => setIdx((v) => clamp(v - 1, 0, total - 1));
  const goNext = () => setIdx((v) => clamp(v + 1, 0, total - 1));

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background p-6 md:p-10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des slides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <Card className="shadow-sm rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl md:text-3xl min-h-[2.5rem]">{slideTitle}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Slide {safeIdx + 1} / {total}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={goPrev} disabled={safeIdx === 0 || total === 0}>
                  Précédent
                </Button>
                <Button onClick={goNext} disabled={safeIdx === total - 1 || total === 0}>
                  Suivant
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-w-none">
              <ReactMarkdown components={markdownComponents}>
                {slideBody}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 flex flex-wrap gap-2">
          {slides.map((_, i) => (
            <Button key={i} size="sm" variant={i === safeIdx ? "default" : "outline"} onClick={() => setIdx(i)}>
              {i + 1}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
