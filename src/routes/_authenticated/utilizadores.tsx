import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { eliminarUsuario } from "@/lib/usuarios.functions";
import { NOMES_PAPEL, useDisciplinas, useMe, type Papel } from "@/lib/dados";
import { nomeClasse } from "@/lib/avaliacao";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageTitle } from "@/components/escola";

export const Route = createFileRoute("/_authenticated/utilizadores")({
  head: () => ({ meta: [{ title: "Utilizadores — J. ZYMAR" }, { name: "description", content: "Gestão de utilizadores." }] }),
  component: Utilizadores,
});

function Utilizadores() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const eliminar = useServerFn(eliminarUsuario);
  const [cargo, setCargo] = useState<Record<string, Papel>>({});
  const [atribuir, setAtribuir] = useState<{ id: string; nome: string } | null>(null);

  const { data: users = [] } = useQuery({
    queryKey: ["utilizadores"],
    enabled: !!me?.isStaff,
    queryFn: async () => {
      const [{ data: p }, { data: r }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at"),
        supabase.from("user_roles").select("*"),
      ]);
      return (p ?? []).map((u) => ({ ...u, papeis: (r ?? []).filter((x) => x.user_id === u.id).map((x) => x.role as Papel) }));
    },
  });

  if (!me?.isStaff) return <p>Sem permissão.</p>;
  const refresh = () => qc.invalidateQueries({ queryKey: ["utilizadores"] });

  async function credenciar(id: string, def: string) {
    const role = cargo[id] ?? (def as Papel);
    const { error } = await supabase.rpc("credenciar_usuario", { _uid: id, _role: role });
    if (error) return void toast.error(error.message);
    toast.success("Utilizador credenciado."); refresh();
  }
  async function revogar(id: string) {
    const { error } = await supabase.rpc("revogar_usuario", { _uid: id });
    if (error) return void toast.error(error.message);
    toast.success("Acesso revogado."); refresh();
  }
  async function apagar(id: string) {
    if (!confirm("Eliminar definitivamente este utilizador?")) return;
    try { await eliminar({ data: { id } }); toast.success("Utilizador eliminado."); refresh(); }
    catch (e) { toast.error((e as Error).message); }
  }

  const papeisDisponiveis: Papel[] = me.isAdmin ? ["admin", "pedagogico", "coordenador", "professor"] : ["pedagogico", "coordenador", "professor"];

  return (
    <div>
      <PageTitle title="Gestão de Utilizadores" />
      <Table>
        <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Email</TableHead><TableHead>Estado</TableHead><TableHead>Cargo</TableHead><TableHead className="text-right">Acções</TableHead></TableRow></TableHeader>
        <TableBody>
          {users.map((u) => {
            const atual = u.papeis[0] ?? (u.cargo_pretendido as Papel);
            const protegido = u.papeis.includes("admin") && !me.isAdmin;
            return (
              <TableRow key={u.id}>
                <TableCell>{u.nome}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.status === "APROVADO" ? "default" : u.status === "REVOGADO" ? "destructive" : "secondary"}>{u.status}</Badge>
                </TableCell>
                <TableCell>
                  {u.id === me.id || protegido ? NOMES_PAPEL[atual] : (
                    <Select value={cargo[u.id] ?? atual} onValueChange={(v) => setCargo({ ...cargo, [u.id]: v as Papel })}>
                      <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                      <SelectContent>{papeisDisponiveis.map((p) => <SelectItem key={p} value={p}>{NOMES_PAPEL[p]}</SelectItem>)}</SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  {u.id !== me.id && !protegido && (
                    <>
                      <Button size="sm" onClick={() => credenciar(u.id, atual)}>{u.status === "APROVADO" ? "Actualizar" : "Credenciar"}</Button>
                      {u.status === "APROVADO" && <Button size="sm" variant="outline" onClick={() => revogar(u.id)}>Revogar</Button>}
                      {u.papeis.includes("professor") && u.status === "APROVADO" && (
                        <Button size="sm" variant="secondary" onClick={() => setAtribuir({ id: u.id, nome: u.nome })}>Disciplinas</Button>
                      )}
                      {me.isAdmin && <Button size="sm" variant="destructive" onClick={() => apagar(u.id)}>Eliminar</Button>}
                    </>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {atribuir && <Atribuicoes user={atribuir} onClose={() => setAtribuir(null)} />}
    </div>
  );
}

function Atribuicoes({ user, onClose }: { user: { id: string; nome: string }; onClose: () => void }) {
  const { data: disc = [] } = useDisciplinas();
  const qc = useQueryClient();
  const { data: atrib = [] } = useQuery({
    queryKey: ["atribuicoes", user.id],
    queryFn: async () => (await supabase.from("teacher_assignments").select("*").eq("user_id", user.id)).data ?? [],
  });
  async function toggle(sid: string, on: boolean) {
    const { error } = on
      ? await supabase.from("teacher_assignments").insert({ user_id: user.id, subject_id: sid })
      : await supabase.from("teacher_assignments").delete().eq("user_id", user.id).eq("subject_id", sid);
    if (error) toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["atribuicoes", user.id] });
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[80vh] overflow-auto">
        <DialogHeader><DialogTitle>Disciplinas de {user.nome}</DialogTitle></DialogHeader>
        <div className="space-y-2">
          {disc.length === 0 && <p className="text-sm text-muted-foreground">Registe primeiro as disciplinas.</p>}
          {disc.map((d) => (
            <label key={d.id} className="flex items-center gap-2 text-sm">
              <Checkbox checked={atrib.some((a) => a.subject_id === d.id)} onCheckedChange={(v) => toggle(d.id, !!v)} />
              {nomeClasse(d.classe)} — {d.nome}
            </label>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
