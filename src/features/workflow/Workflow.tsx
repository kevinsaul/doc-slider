import { useEffect, useState } from "react";
import MarkdownSlideDeck from "@/components/MarkdownSlideDeck";

const slideModules = import.meta.glob("./slides/slide-*.md", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

const slidePaths = Object.keys(slideModules).sort((a, b) =>
  a.localeCompare(b, undefined, { numeric: true }),
);

async function loadAllSlides(): Promise<string[]> {
  return Promise.all(
    slidePaths.map(async (path, index) => {
      try {
        return await slideModules[path]();
      } catch (error) {
        const slideNumber = index + 1;
        console.error(`Error loading slide ${slideNumber}:`, error);
        return `# Erreur de chargement\n\nImpossible de charger le slide ${slideNumber}.`;
      }
    }),
  );
}

export default function Workflow() {
  const [slides, setSlides] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSlides = async () => {
      try {
        setLoading(true);
        const loadedSlides = await loadAllSlides();
        setSlides(loadedSlides);
      } catch (error) {
        console.error("Error loading slides:", error);
        setSlides(["# Erreur\n\nImpossible de charger les slides."]);
      } finally {
        setLoading(false);
      }
    };

    loadSlides();
  }, []);

  return <MarkdownSlideDeck slides={slides} loading={loading} />;
}
