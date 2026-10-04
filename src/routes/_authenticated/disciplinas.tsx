import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDisciplinas, useMe } from "@/lib/dados";
import { cicloDe, escalaMax, isQualitativa, nomeClasse } from "@/lib/avaliacao";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClasseSelect, PageTitle } from "@/components/escola";

export const Route = createFileRoute("/_authenticated/disciplinas")({
  head: () => ({ meta: [{ title: "Disciplinas — J. ZYMAR" }, { name: "description", content: "Disciplinas por ciclo e classe." }] }),
  component: Disciplinas,
});

function Disciplinas() {
  const { data: me } = useMe();
  const [classe, setClasse] = useState("1");
  const [nome, setNome] = useState("");
  const [extra, setExtra] = useState(false);
  const { data: lista } = useDisciplinas(classe);
  const qc = useQueryClient();

  if (!me?.isStaff) return <p>Sem permissão.</p>;

  async function adicionar(e: React.FormEvent) {
    e.preventDefault();
    const n = nome.trim();
    if (!n || n.length > 80) return toast.error("Nome inválido.");
    const { error } = await supabase.from("subjects").insert({ classe, nome: n, extra, ordem: lista?.length ?? 0 });
    if (error) return toast.error(error.code === "23505" ? "Disciplina já existe nesta classe." : error.message);
    setNome(""); setExtra(false);
    qc.invalidateQueries({ queryKey: ["disciplinas"] });
  }

  async function remover(id: string) {
    if (!confirm("Remover esta disciplina? As notas lançadas também serão apagadas.")) return;
    const { error } = await supabase.from("subjects").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["disciplinas"] });
  }

  return (
    <div className="max-w-4xl">
      <PageTitle title="Disciplinas por Ciclo e Classe"><ClasseSelect value={classe} onChange={setClasse} /></PageTitle>
      <p className="mb-4 text-sm text-muted-foreground">
        {cicloDe(classe)} · {nomeClasse(classe)} · Avaliação {isQualitativa(classe) ? "qualitativa (Regular, Bom, Excelente)" : `de 0 a ${escalaMax(classe)} valores`}
      </p>
      <Card className="mb-6"><CardContent className="p-4">
        <form onSubmit={adicionar} className="flex flex-wrap items-center gap-3">
          <Input placeholder="Nome da disciplina" value={nome} onChange={(e) => setNome(e.target.value)} className="max-w-sm" />
          <label className="flex items-center gap-2 text-sm"><Checkbox checked={extra} onCheckedChange={(v) => setExtra(!!v)} /> Extra-curricular</label>
          <Button>Adicionar</Button>
        </form>
      </CardContent></Card>
      <Table>
        <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Disciplina</TableHead><TableHead>Tipo</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>
          {lista?.map((d, i) => (
            <TableRow key={d.id}>
              <TableCell>{i + 1}</TableCell>
              <TableCell>{d.nome}</TableCell>
              <TableCell>{d.extra ? <Badge variant="secondary">Extra-curricular</Badge> : <Badge>Curricular</Badge>}</TableCell>
              <TableCell className="text-right"><Button size="icon" variant="ghost" onClick={() => remover(d.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
            </TableRow>
          ))}
          {lista?.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Nenhuma disciplina registada.</TableCell></TableRow>}
        </TableBody>
      </Table>
    </div>
  );
}
