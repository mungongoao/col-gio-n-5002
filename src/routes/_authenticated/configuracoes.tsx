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
  const { data: inst, isLoading: instLoading } = useInstituicao();
  const qc = useQueryClient();
  type K = "id" | "republica" | "ministerio" | "direccao_municipal" | "nome_escola" | "ano_lectivo" | "logo_url" | "pauta_pedagogico" | "pauta_direccao" | "boletim_coord_manha" | "boletim_coord_tarde" | "cor_fundo" | "cor_texto" | "cor_paginas";
  const [f, setF] = useState<Partial<Record<K, string>>>({});
  const [corTemaPrincipal, setCorTemaPrincipal] = useState("#1e3a5f");
  const [aGuardar, setAGuardar] = useState(false);

  useEffect(() => {
    try { setCorTemaPrincipal(localStorage.getItem("jzymar-cor-tema-principal") || "#1e3a5f"); } catch { /* armazenamento opcional */ }
  }, []);
  useEffect(() => {
    document.documentElement.style.setProperty("--tema-principal", corTemaPrincipal);
  }, [corTemaPrincipal]);
  useEffect(() => {
    if (inst) setF(Object.fromEntries(Object.entries(inst).map(([k, v]) => [k, String(v ?? "")])) as Partial<Record<K, string>>);
  }, [inst]);

  if (!me?.isAdmin) return <p>Apenas o ADM tem acesso a esta página.</p>;

  const set = (k: K) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setF((prev) => ({ ...prev, [k]: value }));
  };

  function carregarLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecciona um ficheiro de imagem válido.");
      e.target.value = "";
      return;
    }
    if (file.size > 400_000) {
      toast.error("O logótipo deve ter menos de 400 KB.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        toast.error("Não foi possível ler o logótipo.");
        return;
      }
      setF((prev) => ({ ...prev, logo_url: reader.result as string }));
      toast.success("Logótipo carregado. Clica em Guardar para aplicar.");
    };
    reader.onerror = () => toast.error("Falha ao carregar o ficheiro do logótipo.");
    reader.readAsDataURL(file);
  }

  async function guardar() {
    if (aGuardar) return;
    setAGuardar(true);
    const { id: _id, ...rest } = f;
    const payload = {
      id: 1,
      ...rest,
      logo_url: f.logo_url || null,
      cor_fundo: f.cor_fundo || "#f8fafc",
      cor_texto: f.cor_texto || "#243247",
      cor_paginas: f.cor_paginas || "#ffffff",
    };
    try {
      const { error } = await supabase
        .from("institution_settings")
        .upsert(payload, { onConflict: "id" });
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["instituicao"] });
      toast.success("Informações da instituição guardadas e aplicadas.");
    } catch (error) {
      // Os erros PostgREST podem ser objectos simples, não instâncias de Error.
      const details = error && typeof error === "object" && "message" in error
        ? String((error as { message: unknown }).message)
        : error instanceof Error ? error.message : String(error ?? "");
      toast.error(details || "Não foi possível guardar as informações. Verifica as permissões e tenta novamente.");
      console.error("Erro ao guardar definições da instituição:", error);
    } finally {
      setAGuardar(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageTitle title="Informações da Instituição">
        <Button onClick={guardar} disabled={aGuardar || instLoading}>
          {aGuardar ? "A guardar..." : "Guardar"}
        </Button>
      </PageTitle>
      <Card>
        <CardHeader><CardTitle>Cabeçalho dos documentos</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {CAMPOS.map(([k, l]) => (
            <div key={k}><Label>{l}</Label><Input type="text" value={f[k] ?? ""} onChange={set(k)} /></div>
          ))}
          <div className="sm:col-span-2">
            <Label>Logótipo da instituição (aparece também na página inicial)</Label>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              {f.logo_url ? (
                <img src={f.logo_url} alt="Pré-visualização do logótipo" className="h-20 w-20 rounded border bg-white object-contain p-1" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded border text-xs text-muted-foreground">Sem logo</div>
              )}
              <Input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={carregarLogo} className="max-w-xs" />
              {f.logo_url && <Button type="button" variant="outline" size="sm" onClick={() => setF((prev) => ({ ...prev, logo_url: "" }))}>Remover</Button>}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Formatos aceites: PNG, JPG, WEBP ou SVG. Tamanho máximo: 400 KB. Depois de carregar, clica em Guardar.</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Personalização das Cores</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2"><Label>Cor de fundo do sistema</Label><Input type="color" value={f.cor_fundo || "#f8fafc"} onChange={set("cor_fundo")} className="h-11 p-1" /></div>
          <div className="space-y-2"><Label>Cor das letras</Label><Input type="color" value={f.cor_texto || "#243247"} onChange={set("cor_texto")} className="h-11 p-1" /></div>
          <div className="space-y-2"><Label>Cor das páginas e cartões</Label><Input type="color" value={f.cor_paginas || "#ffffff"} onChange={set("cor_paginas")} className="h-11 p-1" /></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Tema principal</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2 sm:col-span-3">
            <Label>Cor do tema principal / fundo externo</Label>
            <Input type="color" value={corTemaPrincipal} onChange={(e) => {
              const value = e.target.value;
              setCorTemaPrincipal(value);
              try { localStorage.setItem("jzymar-cor-tema-principal", value); } catch { /* armazenamento opcional */ }
            }} className="h-11 p-1" />
            <p className="text-xs text-muted-foreground">Aplica-se à barra fixa, cabeçalho institucional, página inicial e fundo externo de autenticação. A alteração fica guardada neste navegador.</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Rodapé das Pautas</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div><Label>O Pedagógico (nome para assinatura)</Label><Input type="text" value={f.pauta_pedagogico ?? ""} onChange={set("pauta_pedagogico")} /></div>
          <div><Label>A Direcção (nome para assinatura)</Label><Input type="text" value={f.pauta_direccao ?? ""} onChange={set("pauta_direccao")} /></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Rodapé do Boletim de Notas</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div><Label>O Coordenador da Manhã</Label><Input type="text" value={f.boletim_coord_manha ?? ""} onChange={set("boletim_coord_manha")} /></div>
          <div><Label>O Coordenador da Tarde</Label><Input type="text" value={f.boletim_coord_tarde ?? ""} onChange={set("boletim_coord_tarde")} /></div>
        </CardContent>
      </Card>
    </div>
  );
}
