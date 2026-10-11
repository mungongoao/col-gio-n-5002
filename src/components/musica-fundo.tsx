import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Músicas ambiente geradas no próprio navegador (sem ficheiros nem direitos de autor).
type Faixa = { id: string; nome: string; bpm: number; onda: OscillatorType; acordes: number[][]; melodia: number[] };
const n = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

const PLAYLISTS: Record<"M" | "F" | "N", Faixa[]> = {
  M: [
    { id: "m1", nome: "Horizonte", bpm: 84, onda: "sawtooth", acordes: [[45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59], [40, 47, 52, 55]], melodia: [69, 72, 76, 74, 72, 69, 67, 69] },
    { id: "m2", nome: "Savana", bpm: 92, onda: "square", acordes: [[38, 45, 50, 53], [46, 53, 58, 62], [41, 48, 53, 57], [43, 50, 55, 58]], melodia: [62, 65, 69, 70, 69, 65, 62, 60] },
    { id: "m3", nome: "Kwanza", bpm: 78, onda: "sawtooth", acordes: [[40, 47, 52, 55], [36, 43, 48, 52], [43, 50, 55, 59], [38, 45, 50, 54]], melodia: [64, 67, 71, 72, 71, 67, 66, 64] },
  ],
  F: [
    { id: "f1", nome: "Aurora", bpm: 72, onda: "sine", acordes: [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]], melodia: [76, 79, 81, 79, 76, 74, 72, 74] },
    { id: "f2", nome: "Jardim", bpm: 80, onda: "triangle", acordes: [[53, 57, 60, 64], [50, 53, 57, 60], [46, 50, 53, 58], [48, 52, 55, 60]], melodia: [77, 76, 72, 74, 77, 79, 81, 77] },
    { id: "f3", nome: "Brisa", bpm: 68, onda: "sine", acordes: [[55, 59, 62, 66], [52, 55, 59, 62], [48, 52, 55, 59], [50, 54, 57, 62]], melodia: [79, 83, 81, 78, 79, 74, 76, 78] },
  ],
  N: [
    { id: "n1", nome: "Manhã", bpm: 76, onda: "triangle", acordes: [[48, 55, 60, 64], [43, 50, 55, 59], [45, 52, 57, 60], [41, 48, 53, 57]], melodia: [72, 74, 76, 79, 76, 74, 72, 67] },
    { id: "n2", nome: "Serenidade", bpm: 70, onda: "sine", acordes: [[50, 57, 62, 65], [46, 53, 58, 62], [48, 55, 60, 64], [45, 52, 57, 61]], melodia: [74, 77, 81, 77, 76, 72, 74, 69] },
    { id: "n3", nome: "Caminho", bpm: 82, onda: "triangle", acordes: [[43, 50, 55, 59], [40, 47, 52, 55], [36, 43, 48, 52], [38, 45, 50, 54]], melodia: [71, 74, 79, 78, 74, 71, 72, 74] },
  ],
};

const CHAVE = "musica_recentes";

function escolher(lista: Faixa[]): Faixa {
  let recentes: string[] = [];
  try { recentes = JSON.parse(sessionStorage.getItem(CHAVE) ?? "[]"); } catch { /* ignora */ }
  const novas = lista.filter((f) => !recentes.includes(f.id));
  const pool = novas.length ? novas : lista.filter((f) => f.id !== recentes[recentes.length - 1]);
  const f = pool[Math.floor(Math.random() * pool.length)] ?? lista[0];
  const act = [...recentes.filter((r) => r !== f.id), f.id].slice(-(lista.length - 1));
  sessionStorage.setItem(CHAVE, JSON.stringify(act));
  return f;
}

function tocar(ctx: AudioContext, destino: AudioNode, faixa: Faixa) {
  const beat = 60 / faixa.bpm;
  const compasso = beat * 4;
  let i = 0;
  let proximo = ctx.currentTime + 0.1;
  const nota = (freq: number, ini: number, dur: number, vol: number, tipo: OscillatorType) => {
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = tipo; o.frequency.value = freq;
    g.gain.setValueAtTime(0, ini);
    g.gain.linearRampToValueAtTime(vol, ini + Math.min(0.6, dur / 3));
    g.gain.linearRampToValueAtTime(0, ini + dur);
    o.connect(g).connect(destino); o.start(ini); o.stop(ini + dur + 0.05);
  };
  const agendar = () => {
    while (proximo < ctx.currentTime + compasso) {
      const ac = faixa.acordes[i % faixa.acordes.length];
      ac.forEach((m) => nota(n(m), proximo, compasso, 0.05, faixa.onda === "square" ? "triangle" : faixa.onda));
      for (let b = 0; b < 4; b++) {
        const m = faixa.melodia[(i * 2 + b) % faixa.melodia.length];
        if (b % 2 === 0 || i % 2) nota(n(m), proximo + b * beat, beat * 0.9, 0.04, "sine");
      }
      proximo += compasso; i++;
    }
  };
  agendar();
  return window.setInterval(agendar, 500);
}

export function MusicaFundo() {
  const [mudo, setMudo] = useState(false);
  const [faixa, setFaixa] = useState<Faixa | null>(null);
  const ref = useRef<{ ctx: AudioContext; ganho: GainNode; timer: number } | null>(null);

  useEffect(() => {
    let cancelado = false;
    let limparInteraccao = () => {};
    (async () => {
      let genero: "M" | "F" | "N" = "N";
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          const { data: p } = await supabase.from("profiles").select("genero").eq("id", data.user.id).maybeSingle();
          const g = (p as { genero?: string } | null)?.genero;
          if (g === "M" || g === "F") genero = g;
        }
      } catch { /* visitante */ }
      if (cancelado) return;
      const f = escolher(PLAYLISTS[genero]);
      setFaixa(f);
      const ctx = new AudioContext();
      const ganho = ctx.createGain();
      ganho.gain.value = 0;
      ganho.connect(ctx.destination);
      const timer = tocar(ctx, ganho, f);
      ref.current = { ctx, ganho, timer };
      const fade = () => ganho.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 3);
      if (ctx.state === "running") fade();
      else {
        const iniciar = () => { ctx.resume().then(fade); limparInteraccao(); };
        limparInteraccao = () => ["pointerdown", "keydown", "touchstart"].forEach((e) => window.removeEventListener(e, iniciar));
        ["pointerdown", "keydown", "touchstart"].forEach((e) => window.addEventListener(e, iniciar));
      }
    })();
    return () => {
      cancelado = true; limparInteraccao();
      const r = ref.current;
      if (r) { clearInterval(r.timer); r.ctx.close(); ref.current = null; }
    };
  }, []);

  function alternar() {
    const r = ref.current; if (!r) return;
    const novo = !mudo; setMudo(novo);
    if (r.ctx.state !== "running") r.ctx.resume();
    r.ganho.gain.cancelScheduledValues(r.ctx.currentTime);
    r.ganho.gain.linearRampToValueAtTime(novo ? 0 : 0.5, r.ctx.currentTime + 0.4);
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={mudo ? "Ligar música" : "Desligar música"}
      className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-full bg-background/15 px-3 py-2 text-xs text-primary-foreground backdrop-blur hover:bg-background/25"
    >
      {mudo ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      <span className="hidden sm:inline">{faixa ? faixa.nome : "Música"}</span>
    </button>
  );
}

export function pararMusica() {
  // A música pára ao sair da página inicial (o componente é desmontado).
}
