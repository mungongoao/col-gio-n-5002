import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GuardarDocumento } from "@/components/guardar-documento";
import { TurmaSelect } from "@/components/turma-select";
import { Printer } from "lucide-react";
import { useAlunos, useInstituicao, useMe } from "@/lib/dados";
import { nomeClasse } from "@/lib/avaliacao";
import { Button } from "@/components/ui/button";
import { Assinatura, ClasseSelect, DocCabecalho, PageTitle } from "@/components/escola";

export const Route = createFileRoute("/_authenticated/lista-nominal")({
  head: () => ({ meta: [{ title: "Lista Nominal — J. ZYMAR" }, { name: "description", content: "Lista nominal por classe." }] }),
  component: Lista,
});

function Lista() {
  const { data: me } = useMe();
  const [classe, setClasse] = useState("1");
  const { data: todos = [] } = useAlunos(classe);
  const [turma, setTurma] = useState("todas");
  const alunos = todos.filter((a) => turma === "todas" || a.turma === turma);
  const { data: inst } = useInstituicao();
  const m = alunos?.filter((a) => a.genero === "M").length ?? 0;
  if (me?.isEncarregado) return <p>Sem permissão.</p>;
  return (
    <div>
      <PageTitle title="Lista Nominal">
        <ClasseSelect value={classe} onChange={(v) => { setClasse(v); setTurma("todas"); }} /><TurmaSelect alunos={todos} value={turma} onChange={setTurma} /><GuardarDocumento nome="Lista Nominal" />
        <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Imprimir</Button>
      </PageTitle>
      <div className="print-area overflow-auto">
        <div className="doc doc-a4 mx-auto shadow" >
          <DocCabecalho inst={inst} titulo="Lista Nominal" sub={`${nomeClasse(classe)} · Turma ${turma} · Ano lectivo ${inst?.ano_lectivo ?? ""}`} />
          <table>
            <thead><tr><th style={{ width: 40 }}>Nº</th><th>Nome do Aluno</th><th style={{ width: 70 }}>Género</th><th>Turma</th><th>Estado</th></tr></thead>
            <tbody>
              {alunos?.map((a, i) => (
                <tr key={a.id}><td>{i + 1}</td><td className="esq">{a.nome}</td><td>{a.genero}</td><td>{a.turma}</td><td>{a.estado}</td></tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: 11, marginTop: 6 }}>Total: {alunos?.length ?? 0} · M: {m} · F: {(alunos?.length ?? 0) - m}</p>
          <div className="mt-8 flex justify-around">
            <Assinatura cargo="O Pedagógico" nome={inst?.pauta_pedagogico} />
            <Assinatura cargo="A Direcção" nome={inst?.pauta_direccao} />
          </div>
        </div>
      </div>
    </div>
  );
}
