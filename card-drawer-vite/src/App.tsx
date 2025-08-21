
import React, { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Dice3, Shuffle, Layers, Upload, Loader2, Trash2, ChevronDown, ChevronUp, PlusCircle, Eraser, Layers as LayersIcon } from "lucide-react";
import Papa from "papaparse";

type Row = Record<string, string>;

type DataBundle = {
  characters: Row[];
  items: Row[];
  locations: Row[];
  quests: Row[];
};

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

function ExpandableRow({
  label,
  data,
  expanded,
  onToggle,
}: {
  label: string;
  data?: Row;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-xl border overflow-hidden bg-white">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-neutral-50"
        onClick={onToggle}
      >
        <span className="font-semibold text-neutral-900">{label}</span>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="px-4 pb-4">
              {data ? (
                <dl className="grid gap-1 text-sm text-neutral-900">
                  {Object.entries(data).map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[auto,1fr] gap-x-2">
                      <dt className="text-neutral-600 whitespace-nowrap">{k}:</dt>
                      <dd className="font-medium break-words">{v}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <div className="text-sm text-neutral-600">—</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type CombinedRow = { characters?: Row; items?: Row; locations?: Row; quests?: Row };

function DrawnCard({
  id,
  index,
  row,
  onDismiss,
}: {
  id: string;
  index: number;
  row: CombinedRow;
  onDismiss: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState<"Character" | "Item" | "Location" | "Quest" | null>(null);
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
      <Card className="rounded-2xl shadow-md bg-white border-neutral-200">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary">Row #{index + 1}</Badge>
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-neutral-900">Combined Draw</h3>
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
            <ExpandableRow
              label="Character"
              data={row.characters}
              expanded={expanded === "Character"}
              onToggle={() => setExpanded(expanded === "Character" ? null : "Character")}
            />
            <ExpandableRow
              label="Item"
              data={row.items}
              expanded={expanded === "Item"}
              onToggle={() => setExpanded(expanded === "Item" ? null : "Item")}
            />
            <ExpandableRow
              label="Location"
              data={row.locations}
              expanded={expanded === "Location"}
              onToggle={() => setExpanded(expanded === "Location" ? null : "Location")}
            />
            <ExpandableRow
              label="Quest"
              data={row.quests}
              expanded={expanded === "Quest"}
              onToggle={() => setExpanded(expanded === "Quest" ? null : "Quest")}
            />
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

type Drawn = { id: string; index: number; row: CombinedRow };

export default function App() {
  const [data, setData] = useState<DataBundle>({ characters: [], items: [], locations: [], quests: [] });
  const [allowRepeats, setAllowRepeats] = useState(false);
  const [drawn, setDrawn] = useState<Drawn[]>([]);
  const [remaining, setRemaining] = useState<number[]>([]);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [rollToken, setRollToken] = useState(0);

  const minLen = useMemo(() => {
    const lens = [data.characters.length, data.items.length, data.locations.length, data.quests.length].filter(Boolean);
    return lens.length ? Math.min(...lens) : 0;
  }, [data]);

  const allLoaded = [data.characters, data.items, data.locations, data.quests].every((arr) => arr.length > 0);

  useEffect(() => {
    if (allLoaded && remaining.length === 0) {
      setRemaining(Array.from({ length: minLen }, (_, i) => i));
    }
  }, [allLoaded, minLen, remaining.length]);

  const handleLoad = (key: keyof DataBundle) => (rows: Row[]) => {
    setData((d) => ({ ...d, [key]: rows }));
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

    const row = {
      characters: data.characters[index],
      items: data.items[index],
      locations: data.locations[index],
      quests: data.quests[index],
    } as CombinedRow;

    const id = `${index}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setDrawn((prev) => [{ id, index, row }, ...prev]);
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
            <div className="flex items-center gap-3">
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

          <div className="mt-4 flex items-center gap-2">
            <Button size="lg" className="rounded-2xl gap-2" onClick={drawOne} disabled={!allLoaded || (!allowRepeats && remaining.length === 0)}>
              <Layers className="h-5 w-5" /> Draw from deck
            </Button>
            <Button variant="ghost" className="gap-2" onClick={clearAllCards} disabled={drawn.length === 0}>
              <Trash2 className="h-5 w-5" /> Clear drawn cards
            </Button>
          </div>
        </Section>

        <Section title="Drawn cards" right={<div className="text-sm text-neutral-600">Click a row to expand. Use the red plus to add markers, eraser to clear (max 10).</div>}>
          {drawn.length === 0 ? (
            <EmptyState title="No cards drawn yet" subtitle="Load your CSVs above, then press “Draw from deck”. Each card shows the same row joined from all four sheets." />
          ) : (
            <AnimatePresence initial={false}>
              <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-4">
                {drawn.map(({ id, index, row }) => (
                  <DrawnCard key={id} id={id} index={index} row={row} onDismiss={(removeId) => setDrawn((d) => d.filter((c) => c.id !== removeId))} />
                ))}
              </div>
            </AnimatePresence>
          )}
        </Section>

        <div className="text-xs text-neutral-600 text-center py-2">
          Tip: The same row index across all four CSVs is treated as one "card". Make sure the files are sorted consistently.
        </div>
      </div>
    </div>
  );
}
