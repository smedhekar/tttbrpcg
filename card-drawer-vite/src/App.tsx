import React, { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Dice3, Shuffle, Layers, Upload, Loader2, Trash2, PlusCircle, Eraser, Layers as LayersIcon } from "lucide-react";
import Papa from "papaparse";

type Row = Record<string, string>;

type DataBundle = {
  characters: Row[];
  items: Row[];
  locations: Row[];
  quests: Row[];
};

type Category = keyof DataBundle;

const CATEGORY_OPTIONS: Array<{ key: Category; label: string }> = [
  { key: "characters", label: "Characters" },
  { key: "items", label: "Items" },
  { key: "locations", label: "Locations" },
  { key: "quests", label: "Quests" },
];

const CATEGORY_ORDER: Category[] = CATEGORY_OPTIONS.map((option) => option.key);

const CATEGORY_MATCHES: Record<Category, string[]> = {
  characters: ["characters", "character"],
  items: ["items", "item"],
  locations: ["locations", "location"],
  quests: ["quests", "quest"],
};

const getCategoryLabel = (category: Category) =>
  CATEGORY_OPTIONS.find((option) => option.key === category)?.label ?? category;

const detectCategoryFromFilename = (name: string): Category | null => {
  const lower = name.toLowerCase();
  for (const category of CATEGORY_ORDER) {
    const tokens = CATEGORY_MATCHES[category];
    if (tokens.some((token) => lower.includes(token))) {
      return category;
    }
  }
  return null;
};

const parseCsvFile = (file: File): Promise<Row[]> =>
  new Promise((resolve, reject) => {
    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data.filter(Boolean)),
      error: (error) => reject(error),
    });
  });

function Section({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900">{title}</h2>
        {right}
      </div>
      <div className="rounded-2xl border p-3 sm:p-4 shadow-sm bg-white">
        {children}
      </div>
    </div>
  );
}

function FilePicker({ id, label, onFile }: { id: string; label: string; onFile: (rows: Row[]) => void }) {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (file: File) => {
    setLoading(true);
    setFileName(file.name);
    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data.filter(Boolean);
        onFile(rows);
        setLoading(false);
      },
      error: () => setLoading(false),
    });
  };

  return (
    <div className="flex items-start gap-3">
      <div className="grid gap-2 w-full">
        <Label htmlFor={id} className="text-neutral-800">{label}</Label>
        <div className="flex items-center gap-2 w-full">
          <Input
            id={id}
            type="file"
            accept=".csv,text/csv"
            ref={inputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            className="text-neutral-900 placeholder:text-neutral-500 file:text-neutral-900"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => inputRef.current?.click()}
            className="gap-2"
          >
            <Upload className="h-4 w-4" /> Upload CSV
          </Button>
          {loading && (
            <Badge variant="secondary" className="gap-1">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Parsing…
            </Badge>
          )}
        </div>
        {fileName && (
          <div className="text-sm">
            <span className="text-neutral-700">Loaded:</span>{" "}
            <span className="font-medium text-neutral-900">{fileName}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-dashed p-8 py-14 text-neutral-700">
      <LayersIcon className="h-8 w-8 mb-3 opacity-70" />
      <div className="text-base font-medium">{title}</div>
      <div className="text-sm text-neutral-600 mt-1 max-w-prose">{subtitle}</div>
    </div>
  );
}

function DrawnCard({ id, index, row, category, onDismiss }: { id: string; index: number; row: Row; category: Category; onDismiss: (id: string) => void; }) {
  const [pips, setPips] = useState<number>(0);
  const addPip = () => setPips((n) => Math.min(10, n + 1));
  const clearPips = () => setPips(0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="relative"
    >
      <Card className="rounded-2xl shadow-md bg-white border-neutral-200 h-full">
        <CardContent className="p-3 sm:p-5 lg:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary">Row #{index + 1}</Badge>
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-neutral-900">{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
            </div>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" onClick={addPip} disabled={pips >= 10} title={pips >= 10 ? "Max 10 markers" : "Add red marker"}>
                <PlusCircle className="h-5 w-5 text-red-600" />
              </Button>
              <Button size="icon" variant="ghost" onClick={clearPips} disabled={pips === 0} title={pips === 0 ? "No markers to clear" : "Clear markers"}>
                <Eraser className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => onDismiss(id)} aria-label="Dismiss card">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="grid gap-3 mt-4">
            <dl className="grid gap-2 text-sm text-neutral-900">
              {Object.entries(row).map(([k, v]) => (
                <div key={k} className="grid gap-1">
                  <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">{k}</dt>
                  <dd className="font-medium break-words text-neutral-900">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-neutral-600">Markers <span className="ml-1">({pips}/10)</span></div>
            <div className="flex items-center gap-1 flex-wrap">
              {Array.from({ length: pips }).map((_, i) => (
                <span key={i} className="w-3 h-3 rounded-full bg-red-600 border border-red-700 shadow" />
              ))}
              {Array.from({ length: Math.max(0, 10 - pips) }).map((_, i) => (
                <span key={`empty-${i}`} className="w-3 h-3 rounded-full border border-dashed border-neutral-300 opacity-40" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

type Drawn = { id: string; index: number; row: Row; category: Category };

export default function App() {
  const [data, setData] = useState<DataBundle>({ characters: [], items: [], locations: [], quests: [] });
  const [allowRepeats, setAllowRepeats] = useState(false);
  const [drawn, setDrawn] = useState<Drawn[]>([]);
  const [remaining, setRemaining] = useState<number[]>([]);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [rollToken, setRollToken] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<Category>("characters");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<string | null>(null);
  const bulkInputRef = useRef<HTMLInputElement | null>(null);

  const selectCategory = (category: Category) => {
    setSelectedCategory(category);
    setRemaining([]);
  };

  const minLen = useMemo(() => {
    return data[selectedCategory].length;
  }, [data, selectedCategory]);

  const allLoaded = minLen > 0;

  useEffect(() => {
    if (allLoaded && remaining.length === 0) {
      setRemaining(Array.from({ length: minLen }, (_, i) => i));
    }
  }, [allLoaded, minLen, remaining.length]);

  const handleLoad = (key: keyof DataBundle) => (rows: Row[]) => {
    setData((d) => ({ ...d, [key]: rows }));
    // Clear existing draws / remaining to avoid mismatches
    setRemaining([]);
    setDrawn([]);
  };

  const drawOne = () => {
    if (!allLoaded || minLen === 0) return;

    let index: number;
    if (allowRepeats) {
      index = Math.floor(Math.random() * minLen);
    } else {
      if (remaining.length === 0) return;
      const rIdx = Math.floor(Math.random() * remaining.length);
      index = remaining[rIdx];
      const newRemaining = [...remaining];
      newRemaining.splice(rIdx, 1);
      setRemaining(newRemaining);
    }

    const row = data[selectedCategory][index];

    const id = `${index}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setDrawn((prev) => [{ id, index, row, category: selectedCategory }, ...prev]);
  };

  const reshuffle = () => {
    if (!allLoaded) return;
    setRemaining(Array.from({ length: minLen }, (_, i) => i));
  };

  const clearAllCards = () => setDrawn([]);

  const rollOneToThree = () => {
    setLastRoll(1 + Math.floor(Math.random() * 3));
    setRollToken((t) => t + 1);
  };

  const handleBulkUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList).filter((file) => file.name.toLowerCase().endsWith(".csv"));
    if (files.length === 0) {
      setBulkStatus("No CSV files selected.");
      if (bulkInputRef.current) bulkInputRef.current.value = "";
      return;
    }

    setBulkLoading(true);
    setBulkStatus(null);

    try {
      const parsed = await Promise.all(
        files.map((file) =>
          parseCsvFile(file)
            .then((rows) => ({ file, rows }))
            .catch(() => ({ file, rows: null as Row[] | null }))
        )
      );

      const assignments: string[] = [];
      const failures: string[] = [];
      const skipped: string[] = [];
      const newData: Partial<DataBundle> = {};
      const assigned = new Set<Category>();
      const assignedCounts = new Map<Category, number>();
      const unmatched: Array<{ file: File; rows: Row[] }> = [];

      parsed.forEach(({ file, rows }) => {
        if (!rows) {
          failures.push(file.name);
          return;
        }
        const detected = detectCategoryFromFilename(file.name);
        if (detected) {
          newData[detected] = rows;
          assigned.add(detected);
          const prevCount = assignedCounts.get(detected) ?? 0;
          assignedCounts.set(detected, prevCount + 1);
          const overrideNote = prevCount > 0 ? " (overrides previous)" : "";
          assignments.push(`${file.name} → ${getCategoryLabel(detected)}${overrideNote}`);
        } else {
          unmatched.push({ file, rows });
        }
      });

      const fallbackQueue = CATEGORY_ORDER.filter((category) => !assigned.has(category));

      unmatched.forEach(({ file, rows }) => {
        if (fallbackQueue.length === 0) {
          skipped.push(file.name);
          return;
        }
        const fallbackCategory = fallbackQueue.shift()!;
        newData[fallbackCategory] = rows;
        assigned.add(fallbackCategory);
        const label = getCategoryLabel(fallbackCategory);
        assignments.push(`${file.name} → ${label} (default)`);
      });

      if (Object.keys(newData).length > 0) {
        setData((prev) => ({ ...prev, ...newData }));
        setRemaining([]);
        setDrawn([]);
      }

      const statusParts: string[] = [];
      if (assignments.length) {
        statusParts.push(
          `Loaded ${assignments.length} file${assignments.length === 1 ? "" : "s"}: ${assignments.join(", ")}`
        );
      }
      if (skipped.length) {
        statusParts.push(`Skipped (no slots left): ${skipped.join(", ")}`);
      }
      if (failures.length) {
        statusParts.push(`Failed to parse: ${failures.join(", ")}`);
      }
      setBulkStatus(statusParts.join(" | ") || "No files were processed.");
    } catch (error) {
      setBulkStatus("Bulk upload failed.");
    } finally {
      setBulkLoading(false);
      if (bulkInputRef.current) bulkInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-neutral-50 to-neutral-100 p-4 sm:p-6 text-neutral-900">
      <div className="max-w-7xl mx-auto grid gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Card Drawer</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-2xl border bg-white px-3 py-2">
              <Dice3 className="h-5 w-5" />
              <Button onClick={rollOneToThree} className="rounded-xl">Roll 1–3</Button>
              <motion.div
                key={rollToken}
                initial={{ scale: 0.9, opacity: 0.6 }}
                animate={{ scale: [0.9, 1.15, 1], opacity: [0.6, 1, 1] }}
                transition={{ duration: 0.35 }}
                className="w-10 h-10 rounded-xl border flex items-center justify-center text-xl font-semibold select-none"
                aria-live="polite"
              >
                {lastRoll ?? "—"}
              </motion.div>
            </div>
          </div>
        </div>

        <Section
          title="Load your four CSVs"
          right={
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Label htmlFor="repeats" className="text-sm text-neutral-700">Allow repeats</Label>
                <Switch id="repeats" checked={allowRepeats} onCheckedChange={setAllowRepeats} />
              </div>

              <Button variant="secondary" className="gap-2" onClick={reshuffle} disabled={!allLoaded}>
                <Shuffle className="h-4 w-4" /> Reshuffle deck
              </Button>
            </div>
          }
        >
          <div className="grid lg:grid-cols-2 gap-4">
            <FilePicker id="characters" label="Characters CSV" onFile={handleLoad("characters")} />
            <FilePicker id="items" label="Items CSV" onFile={handleLoad("items")} />
            <FilePicker id="locations" label="Locations CSV" onFile={handleLoad("locations")} />
            <FilePicker id="quests" label="Quests CSV" onFile={handleLoad("quests")} />
          </div>

          <div className="mt-6">
            <div className="flex items-start gap-3">
              <div className="grid gap-2 w-full">
                <Label htmlFor="bulk-upload" className="text-neutral-800">Bulk upload CSVs</Label>
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    id="bulk-upload"
                    type="file"
                    accept=".csv,text/csv"
                    multiple
                    ref={bulkInputRef}
                    onChange={(e) => handleBulkUpload(e.target.files)}
                    className="text-neutral-900 placeholder:text-neutral-500 file:text-neutral-900"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => bulkInputRef.current?.click()}
                    className="gap-2"
                    disabled={bulkLoading}
                  >
                    <Upload className="h-4 w-4" /> Upload multiple CSVs
                  </Button>
                  {bulkLoading && (
                    <Badge variant="secondary" className="gap-1">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Parsing…
                    </Badge>
                  )}
                </div>
                {bulkStatus && (
                  <div className="text-sm text-neutral-700">{bulkStatus}</div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <Badge variant="outline">Characters: {data.characters.length}</Badge>
            <Badge variant="outline">Items: {data.items.length}</Badge>
            <Badge variant="outline">Locations: {data.locations.length}</Badge>
            <Badge variant="outline">Quests: {data.quests.length}</Badge>
            <Badge>Deck size: {minLen}</Badge>
            {!allowRepeats && (
              <Badge variant="secondary">Remaining: {remaining.length}</Badge>
            )}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-neutral-700">Draw from</span>
              {CATEGORY_OPTIONS.map(({ key, label }) => (
                <Button
                  key={key}
                  size="sm"
                  variant={selectedCategory === key ? "default" : "secondary"}
                  onClick={() => selectCategory(key)}
                  aria-pressed={selectedCategory === key}
                  className="rounded-lg"
                >
                  {label}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button size="lg" className="rounded-2xl gap-2" onClick={drawOne} disabled={!allLoaded || (!allowRepeats && remaining.length === 0)}>
                <Layers className="h-5 w-5" /> Draw from deck
              </Button>
              <Button variant="ghost" className="gap-2" onClick={clearAllCards} disabled={drawn.length === 0}>
                <Trash2 className="h-5 w-5" /> Clear drawn cards
              </Button>
            </div>
          </div>
        </Section>

        <Section title="Drawn cards" right={<div className="text-sm text-neutral-600">Showing only the selected category's details for each drawn card. Use markers to keep track.</div>}>
          {drawn.length === 0 ? (
            <EmptyState title="No cards drawn yet" subtitle="Load any CSV above, choose a category button, then press “Draw from deck”." />
          ) : (
            <div className="max-h-[90vh] md:max-h-[880px] md:min-h-[620px] overflow-y-auto pr-2 pb-1">
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 auto-rows-fr">
                <AnimatePresence initial={false}>
                  {drawn.map(({ id, index, row, category }) => (
                    <DrawnCard key={id} id={id} index={index} row={row} category={category} onDismiss={(removeId) => setDrawn((d) => d.filter((c) => c.id !== removeId))} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </Section>

        <div className="text-xs text-neutral-600 text-center py-2">
          Tip: Pick the category button you want to draw from. Each draw shows the row from the chosen CSV only — files do not need to align across sheets anymore.
        </div>
      </div>
    </div>
  );
}
