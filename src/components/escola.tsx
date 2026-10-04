import { CLASSES, nomeClasse } from "@/lib/avaliacao";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { useInstituicao } from "@/lib/dados";

type Inst = ReturnType<typeof useInstituicao>["data"];

export function ClasseSelect({ value, onChange, className }: { value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className ?? "w-48"}><SelectValue placeholder="Classe" /></SelectTrigger>
      <SelectContent>
        {CLASSES.map((c) => <SelectItem key={c} value={c}>{nomeClasse(c)}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

export function PageTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 print:hidden">
      <h1 className="text-3xl font-semibold text-primary">{title}</h1>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function DocCabecalho({ inst, titulo, sub }: { inst: Inst; titulo: string; sub?: string }) {
  return (
    <div className="mb-3 text-center" style={{ fontSize: 12 }}>
      {inst?.logo_url && <img src={inst.logo_url} alt="" style={{ height: 48, margin: "0 auto 4px" }} />}
      <div style={{ fontWeight: 700 }}>{inst?.republica}</div>
      <div>{inst?.ministerio}</div>
      {inst?.direccao_municipal && <div>{inst.direccao_municipal}</div>}
      <div style={{ fontWeight: 700 }}>{inst?.nome_escola}</div>
      <div style={{ fontWeight: 700, marginTop: 6, fontSize: 14, textTransform: "uppercase" }}>{titulo}</div>
      {sub && <div>{sub}</div>}
    </div>
  );
}

export function Assinatura({ cargo, nome }: { cargo: string; nome?: string | null | undefined }) {
  return (
    <div className="text-center" style={{ fontSize: 11, minWidth: 160 }}>
      <div>{cargo}</div>
      <div style={{ borderBottom: "1px solid black", height: 28, margin: "0 12px" }} />
      <div>{nome || " "}</div>
    </div>
  );
}
