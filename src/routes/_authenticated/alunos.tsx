import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Printer, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAlunos, useInstituicao, useMe, type Aluno } from "@/lib/dados";
import { GuardarDocumento } from "@/components/guardar-documento";
import { nomeClasse } from "@/lib/avaliacao";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClasseSelect, DocCabecalho, PageTitle } from "@/components/escola";

export const Route = createFileRoute("/_authenticated/alunos")({
  head: () => ({ meta: [{ title: "Cadastro de Alunos — J. ZYMAR" }, { name: "description", content: "Registo de alunos." }] }),
  component: Alunos,
});

const schema = z.object({
  nome: z.string().trim().min(3, "Nome demasiado curto").max(120),
  bi: z.string().trim().max(30),
  telefone: z.string().trim().max(20).regex(/^[0-9+ ]*$/, "Telefone inválido"),
  idade: z.coerce.number().int().min(2, "Idade inválida").max(30, "Idade inválida"),
  genero: z.enum(["M", "F"]),
  classe: z.string().min(1, "Escolha a classe"),
  turma: z.string().trim().min(1, "Indique a turma").max(30),
  estado: z.enum(["Activo", "Desistente"]),
});

const POR_PAGINA = 15;
const vazio = { nome: "", bi: "", telefone: "", idade: "", genero: "M", classe: "1", turma: "A", estado: "Activo" };

function Alunos() {
  const { data: me } = useMe();
  const { data: alunos } = useAlunos();
  const { data: inst } = useInstituicao();
  const qc = useQueryClient();
  const [f, setF] = useState(vazio);
  const [pag, setPag] = useState(0);
  const [busca, setBusca] = useState("");
  const [ficha, setFicha] = useState<Aluno | null>(null);

  const ordenados = useMemo(
    () => (alunos ?? []).slice().sort((a, b) => a.id - b.id).filter((a) => a.nome.toLowerCase().includes(busca.toLowerCase())),
    [alunos, busca],
  );
  const total = Math.max(1, Math.ceil(ordenados.length / POR_PAGINA));
  const pagina = ordenados.slice(pag * POR_PAGINA, (pag + 1) * POR_PAGINA);

  if (!me?.isStaff) return <p>Sem permissão.</p>;

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    const p = schema.safeParse(f);
    if (!p.success) return void toast.error(p.error.issues[0]?.message);
    const { error } = await supabase.from("students").insert(p.data);
    if (error) return void toast.error(error.message);
    toast.success(`Aluno inscrito na lista nominal da ${nomeClasse(p.data.classe)}.`);
    setF({ ...vazio, classe: f.classe });
    qc.invalidateQueries({ queryKey: ["alunos"] });
  }

  async function eliminar(id: number) {
    if (!confirm("Eliminar este aluno e todas as suas notas?")) return;
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) return void toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["alunos"] });
  }

  function imprimirFicha(aluno: Aluno) {
    setFicha(aluno);
    window.setTimeout(() => window.print(), 0);
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <div>
      <PageTitle title="Cadastro de Alunos" />
      <Card className="mb-6"><CardContent className="p-4">
        <form onSubmit={cadastrar} className="grid gap-3 md:grid-cols-6">
          <div className="md:col-span-2"><Label>Nome do aluno</Label><Input value={f.nome} onChange={set("nome")} /></div>
          <div><Label>BI / Cédula</Label><Input value={f.bi} onChange={set("bi")} /></div>
          <div><Label>Telefone</Label><Input value={f.telefone} onChange={set("telefone")} /></div>
          <div><Label>Idade</Label><Input type="number" value={f.idade} onChange={set("idade")} /></div>
          <div>
            <Label>Género</Label>
            <Select value={f.genero} onValueChange={(v) => setF({ ...f, genero: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="M">Masculino</SelectItem><SelectItem value="F">Feminino</SelectItem></SelectContent>
            </Select>
          </div>
          <div><Label>Classe</Label><ClasseSelect value={f.classe} onChange={(v) => setF({ ...f, classe: v })} className="w-full" /></div>
          <div><Label>Turma</Label><Input value={f.turma} onChange={set("turma")} /></div>
          <div><Label>Estado</Label><Select value={f.estado} onValueChange={(v) => setF({ ...f, estado: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Activo">Activo</SelectItem><SelectItem value="Desistente">Desistente</SelectItem></SelectContent></Select></div>
          <div className="flex items-end md:col-span-3"><Button>Cadastrar aluno</Button></div>
        </form>
      </CardContent></Card>

      <Input placeholder="Pesquisar por nome…" value={busca} onChange={(e) => { setBusca(e.target.value); setPag(0); }} className="mb-3 max-w-sm" />
      <Table>
        <TableHeader><TableRow>
          <TableHead>ID</TableHead><TableHead>Nome do Aluno</TableHead><TableHead>BI/Cédula</TableHead><TableHead>Telefone</TableHead>
          <TableHead>Idade</TableHead><TableHead>Género</TableHead><TableHead>Classe</TableHead><TableHead>Turma</TableHead><TableHead>Estado</TableHead><TableHead />
        </TableRow></TableHeader>
        <TableBody>
          {pagina.map((a) => (
            <TableRow key={a.id}>
              <TableCell>{a.id}</TableCell><TableCell>{a.nome}</TableCell><TableCell>{a.bi}</TableCell><TableCell>{a.telefone}</TableCell>
              <TableCell>{a.idade}</TableCell><TableCell>{a.genero}</TableCell><TableCell>{nomeClasse(a.classe)}</TableCell><TableCell>{a.turma}</TableCell><TableCell><Select value={a.estado} onValueChange={async (estado) => { const { error } = await supabase.from("students").update({ estado }).eq("id", a.id); if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["alunos"] }); }}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Activo">Activo</SelectItem><SelectItem value="Desistente">Desistente</SelectItem></SelectContent></Select></TableCell>
              <TableCell className="flex justify-end gap-1">
                <Button size="icon" variant="ghost" title="Imprimir ficha" onClick={() => imprimirFicha(a)}><Printer className="h-4 w-4" /></Button>
                <GuardarDocumento selector=".ficha-doc" nome={`Ficha ${a.nome}`} preparar={() => setFicha(a)} />
                 <Button size="icon" variant="ghost" title="Eliminar aluno" onClick={() => eliminar(a.id)}><Trash2 className="h-4 w-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
          {pagina.length === 0 && <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground">Sem alunos.</TableCell></TableRow>}
        </TableBody>
      </Table>
      <div className="mt-4 flex items-center gap-3 text-sm">
        <Button size="sm" variant="outline" disabled={pag === 0} onClick={() => setPag(pag - 1)}>Anterior</Button>
        Página {pag + 1} de {total}
        <Button size="sm" variant="outline" disabled={pag + 1 >= total} onClick={() => setPag(pag + 1)}>Seguinte</Button>
      </div>
      {ficha && <div className="print-area hidden print:block">
        <div className="doc doc-a4 ficha-doc mx-auto">
          <DocCabecalho inst={inst} titulo="Ficha do Aluno" sub={`Ano lectivo ${inst?.ano_lectivo ?? ""}`} />
          <table className="mt-8"><tbody>
            <tr><th className="esq">ID</th><td className="esq">{ficha.id}</td></tr>
            <tr><th className="esq">Nome do Aluno</th><td className="esq">{ficha.nome}</td></tr>
            <tr><th className="esq">BI / Cédula</th><td className="esq">{ficha.bi || "—"}</td></tr>
            <tr><th className="esq">Telefone</th><td className="esq">{ficha.telefone || "—"}</td></tr>
            <tr><th className="esq">Idade</th><td className="esq">{ficha.idade ?? "—"}</td></tr>
            <tr><th className="esq">Género</th><td className="esq">{ficha.genero === "M" ? "Masculino" : "Feminino"}</td></tr>
            <tr><th className="esq">Classe</th><td className="esq">{nomeClasse(ficha.classe)}</td></tr>
             <tr><th>Turma</th><td>{ficha.turma}</td></tr><tr><th>Estado</th><td>{ficha.estado}</td></tr>
          </tbody></table>
        </div>
      </div>}
    </div>
  );
}
