import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useInstituicao, useMe } from "@/lib/dados";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTitle } from "@/components/escola";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({ meta: [{ title: "Instituição — J. ZYMAR" }, { name: "description", content: "Dados institucionais dos documentos." }] }),
  component: Config,
});

const CAMPOS = [
  ["republica", "República"],
  ["ministerio", "Ministério"],
  ["direccao_municipal", "Direcção Municipal"],
  ["nome_escola", "Nome da escola"],
  ["ano_lectivo", "Ano lectivo"],
] as const;

function Config() {
  const { data: me } = useMe();
  const { data: inst } = useInstituicao();
  const qc = useQueryClient();
  const [f, setF] = useState<Record<string, string>>({});
  useEffect(() => {
    if (inst) setF(Object.fromEntries(Object.entries(inst).map(([k, v]) => [k, (v ?? "") as string])));
  }, [inst]);

  if (!me?.isAdmin) return <p>Apenas o ADM tem acesso a esta página.</p>;

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  function carregarLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 400_000) return toast.error("O logótipo deve ter menos de 400 KB.");
    const r = new FileReader();
    r.onload = () => setF((p) => ({ ...p, logo_url: r.result as string }));
    r.readAsDataURL(file);
  }

  async function guardar() {
    const { id: _id, ...rest } = f;
    const { error } = await supabase.from("institution_settings").update({ ...rest, logo_url: f.logo_url || null }).eq("id", 1);
    if (error) return toast.error(error.message);
    toast.success("Informações guardadas.");
    qc.invalidateQueries({ queryKey: ["instituicao"] });
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageTitle title="Informações da Instituição"><Button onClick={guardar}>Guardar</Button></PageTitle>
      <Card>
        <CardHeader><CardTitle>Cabeçalho dos documentos</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {CAMPOS.map(([k, l]) => (
            <div key={k}><Label>{l}</Label><Input value={f[k] ?? ""} onChange={set(k)} /></div>
          ))}
          <div className="sm:col-span-2">
            <Label>Logótipo da instituição (aparece também na página inicial)</Label>
            <div className="mt-2 flex items-center gap-4">
              {f.logo_url && <img src={f.logo_url} alt="Logótipo" className="h-20 w-20 rounded border object-contain" />}
              <Input type="file" accept="image/*" onChange={carregarLogo} className="max-w-xs" />
              {f.logo_url && <Button variant="outline" size="sm" onClick={() => setF({ ...f, logo_url: "" })}>Remover</Button>}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Rodapé das Pautas</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div><Label>O Pedagógico (nome para assinatura)</Label><Input value={f.pauta_pedagogico ?? ""} onChange={set("pauta_pedagogico")} /></div>
          <div><Label>A Direcção (nome para assinatura)</Label><Input value={f.pauta_direccao ?? ""} onChange={set("pauta_direccao")} /></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Rodapé do Boletim de Notas</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div><Label>O Coordenador da Manhã</Label><Input value={f.boletim_coord_manha ?? ""} onChange={set("boletim_coord_manha")} /></div>
          <div><Label>O Coordenador da Tarde</Label><Input value={f.boletim_coord_tarde ?? ""} onChange={set("boletim_coord_tarde")} /></div>
        </CardContent>
      </Card>
    </div>
  );
}
