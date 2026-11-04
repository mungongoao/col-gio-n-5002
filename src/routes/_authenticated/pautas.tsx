import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAlunos, useDisciplinas, useInstituicao, useMe, useNotasClasse } from "@/lib/dados";
import {
  cicloDe, fmt, mediaGeral, isClasseExame, isQualitativa, mediaTrimestral, nomeClasse, notaMinima, resultadoFinal, resultadoTrimestreDetalhado, resumoDisciplina, temExameOral,
} from "@/lib/avaliacao";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Assinatura, ClasseSelect, DocCabecalho, PageTitle } from "@/components/escola";
import { GuardarDocumento } from "@/components/guardar-documento";

export const Route = createFileRoute("/_authenticated/pautas")({
  head: () => ({ meta: [{ title: "Pautas — J. ZYMAR" }, { name: "description", content: "Mini-pautas, pautas trimestrais e final." }] }),
  component: Pautas,
});

function Pautas() {
  const { data: me } = useMe();
  const [tipo, setTipo] = useState("mini");
  const [classe, setClasse] = useState("1");
  const [disc, setDisc] = useState("");
  const [tri, setTri] = useState("1");
  const { data: inst } = useInstituicao();
  const { data: disciplinas = [] } = useDisciplinas(classe);
  const { data: alunos = [] } = useAlunos(classe);
  const { data: notas = [] } = useNotasClasse(classe);
  const { data: atribuicoes = [] } = useQuery({
    queryKey: ["atribuicoes-pautas", me?.id],
    enabled: !!me?.isProfessor,
    queryFn: async () => (await supabase.from("teacher_assignments").select("subject_id, subjects(classe)").eq("user_id", me?.id ?? "")).data ?? [],
  });
  const ciclosProfessor = useMemo(() => new Set(atribuicoes.map((a) => cicloDe(a.subjects?.classe ?? ""))), [atribuicoes]);
  const podeVerClasse = !me?.isProfessor || ciclosProfessor.has(cicloDe(classe));
  useEffect(() => { if (me?.isProfessor && tipo !== "tri") setTipo("tri"); }, [me?.isProfessor, tipo]);
  const notasDe = (aid: number, sid: string) => notas.filter((n) => n.student_id === aid && n.subject_id === sid);
  const nt = (aid: number, sid: string, t: number) => notas.find((n) => n.student_id === aid && n.subject_id === sid && n.trimestre === t);
  const qual = isQualitativa(classe);
  const exame = isClasseExame(classe);
  const min = notaMinima(classe);
  const cls = (v: number | null) => (v == null ? "" : v < min ? "neg" : "pos");
  const disciplina = disciplinas.find((d) => d.id === disc);

  const titulo = tipo === "mini" ? "Mini-Pauta" : tipo === "tri" ? `Pauta do ${tri}º Trimestre` : "Pauta Final";
  const sub = `${nomeClasse(classe)}${tipo === "mini" && disciplina ? ` · ${disciplina.nome}` : ""} · Ano lectivo ${inst?.ano_lectivo ?? ""}`;
  const nomeImpressao = tipo === "mini" && disciplina
    ? `Pauta - ${disciplina.nome} - ${nomeClasse(classe)}`
    : `Pauta - ${nomeClasse(classe)}`;
  function imprimir() {
    const anterior = document.title;
    document.title = nomeImpressao;
    window.addEventListener("afterprint", () => { document.title = anterior; }, { once: true });
    window.print();
  }

  if (me?.isEncarregado) return <p>Sem permissão.</p>;

  return (
    <div>
      <PageTitle title="Pautas">
        {!me?.isProfessor && <Tabs value={tipo} onValueChange={setTipo}>
          <TabsList><TabsTrigger value="mini">Mini-Pauta</TabsTrigger><TabsTrigger value="tri">Trimestral</TabsTrigger><TabsTrigger value="final">Final</TabsTrigger></TabsList>
        </Tabs>}
        <ClasseSelect value={classe} onChange={(v) => { setClasse(v); setDisc(""); }} />
        {tipo === "mini" && (
          <Select value={disc} onValueChange={setDisc}>
            <SelectTrigger className="w-52"><SelectValue placeholder="Disciplina" /></SelectTrigger>
            <SelectContent>{disciplinas.map((d) => <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>)}</SelectContent>
          </Select>
        )}
        {tipo === "tri" && (
          <Select value={tri} onValueChange={setTri}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>{["1", "2", "3"].map((t) => <SelectItem key={t} value={t}>{t}º Trimestre</SelectItem>)}</SelectContent>
          </Select>
        )}
        <Button variant="outline" onClick={imprimir}><Printer className="mr-2 h-4 w-4" />Imprimir / PDF</Button>
        <GuardarDocumento nome={nomeImpressao} disabled={tipo === "mini" && !disciplina} />
      </PageTitle>

      {!podeVerClasse ? <p className="text-muted-foreground">Esta classe não pertence ao ciclo das suas disciplinas.</p> : tipo === "mini" && !disciplina ? <p className="text-muted-foreground">Escolha a disciplina.</p> : (
        <div className="print-area overflow-auto">
          <div className={`doc mx-auto shadow ${tipo === "mini" ? "doc-a4" : "doc-a3"}`}>
            <DocCabecalho inst={inst} titulo={titulo} sub={sub} />
            <table>
              {tipo === "mini" && disciplina && (
                <>
                  <thead>
                    <tr>
                      <th rowSpan={2}>Nº</th><th rowSpan={2}>Nome do Aluno</th><th rowSpan={2}>G</th>
                      {[1, 2, 3].map((t) => <th key={t} colSpan={qual ? 1 : 3}>{t}º Trimestre</th>)}
                      {!qual && exame && <th colSpan={temExameOral(disciplina.nome) ? 2 : 1}>Exame</th>}
                      {!qual && <th rowSpan={2}>MFD</th>}
                      {!qual && exame && <th rowSpan={2}>CF</th>}
                      <th rowSpan={2}>Obs.</th>
                    </tr>
                    <tr>
                      {[1, 2, 3].map((t) => qual ? <th key={t}>Aval.</th> : [<th key={`a${t}`}>MAC</th>, <th key={`b${t}`}>NPT</th>, <th key={`c${t}`}>MT{t}</th>])}
                      {!qual && exame && <th>Escrito</th>}
                      {!qual && exame && temExameOral(disciplina.nome) && <th>Oral</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {alunos.map((a, i) => {
                      const r = resumoDisciplina(classe, disciplina.nome, notasDe(a.id, disciplina.id));
                      const t3 = nt(a.id, disciplina.id, 3);
                      return (
                        <tr key={a.id}>
                          <td>{i + 1}</td><td className="esq">{a.nome}</td><td>{a.genero}</td>
                          {[1, 2, 3].map((t) => {
                            const n = nt(a.id, disciplina.id, t);
                            if (qual) return <td key={t}>{n?.qualitativo ?? "—"}</td>;
                            const mt = mediaTrimestral(n);
                            return [<td key={`a${t}`} className={cls(n?.mac ?? null)}>{fmt(n?.mac)}</td>, <td key={`b${t}`} className={cls(n?.npt ?? null)}>{fmt(n?.npt)}</td>, <td key={`c${t}`} className={cls(mt)}><b>{fmt(mt)}</b></td>];
                          })}
                          {!qual && exame && <td>{fmt(t3?.exame_escrito)}</td>}
                          {!qual && exame && temExameOral(disciplina.nome) && <td>{fmt(t3?.exame_oral)}</td>}
                          {!qual && <td className={cls(r.mfd)}><b>{fmt(r.mfd)}</b></td>}
                          {!qual && exame && <td className={cls(r.cf)}><b>{fmt(r.cf)}</b></td>}
                          <td>{r.positiva == null ? "" : r.positiva ? "Positiva" : "Negativa"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </>
              )}

              {tipo === "tri" && (
                <>
                  <thead>
                    <tr>
                      <th rowSpan={2}>Nº</th><th rowSpan={2}>Nome do Aluno</th><th rowSpan={2}>G</th>
                      {disciplinas.map((d) => <th key={d.id} colSpan={qual ? 1 : 3}>{d.nome}{d.extra ? "*" : ""}</th>)}
                      {!qual && <th rowSpan={2}>MFD</th>}
                      <th rowSpan={2}>Resultado</th>
                    </tr>
                    <tr>{disciplinas.map((d) => qual ? <th key={d.id}>Aval.</th> : [<th key={d.id + "a"}>MAC</th>, <th key={d.id + "b"}>NPT</th>, <th key={d.id + "c"}>MT</th>])}</tr>
                  </thead>
                  <tbody>
                    {alunos.map((a, i) => {
                      const medias = disciplinas.map((d) => {
                        const n = nt(a.id, d.id, Number(tri));
                        return { d, n, v: qual ? n?.qualitativo ?? null : mediaTrimestral(n) };
                      });
                      return (
                        <tr key={a.id}>
                          <td>{i + 1}</td><td className="esq">{a.nome}</td><td>{a.genero}</td>
                          {medias.map(({ d, n, v }) => qual ? <td key={d.id}>{v ?? "—"}</td> : [
                            <td key={d.id + "a"} className={cls(n?.mac ?? null)}>{fmt(n?.mac)}</td>, <td key={d.id + "b"} className={cls(n?.npt ?? null)}>{fmt(n?.npt)}</td>,
                            <td key={d.id + "c"} className={cls(v as number | null)}><b>{fmt(v as number | null)}</b></td>,
                          ])}
                          {!qual && (() => { const g = mediaGeral(medias.map((m) => ({ extra: m.d.extra, v: m.v as number | null }))); return <td className={cls(g)}><b>{fmt(g)}</b></td>; })()}
                          <td><b>{resultadoTrimestreDetalhado(classe, medias.map((m) => ({ extra: m.d.extra, disciplina: m.d.nome, v: m.v })), medias.reduce((s, m) => s + (m.n?.faltas ?? 0), 0)) ?? "—"}</b></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </>
              )}

              {tipo === "final" && (
                <>
                  <thead>
                    <tr>
                      <th rowSpan={2}>Nº</th><th rowSpan={2}>Nome do Aluno</th><th rowSpan={2}>G</th>
                      {disciplinas.map((d) => <th key={d.id} colSpan={qual ? 1 : exame ? 5 : 3}>{d.nome}{d.extra ? "*" : ""}</th>)}
                      {!qual && <th rowSpan={2}>MFD</th>}
                      <th rowSpan={2}>Resultado Final</th>
                    </tr>
                    <tr>
                      {disciplinas.map((d) => qual ? <th key={d.id}>Aval.</th> : [
                        <th key={d.id + 1}>MT1</th>, <th key={d.id + 2}>MT2</th>, <th key={d.id + 3}>MT3</th>,
                        ...(exame ? [<th key={d.id + 5}>EX</th>, <th key={d.id + 6}>CF</th>] : []),
                      ])}
                    </tr>
                  </thead>
                  <tbody>
                    {alunos.map((a, i) => {
                      const res = disciplinas.map((d) => ({ d, extra: d.extra, r: resumoDisciplina(classe, d.nome, notasDe(a.id, d.id)) }));
                      const fim = resultadoFinal(classe, res);
                      return (
                        <tr key={a.id}>
                          <td>{i + 1}</td><td className="esq">{a.nome}</td><td>{a.genero}</td>
                          {res.map(({ d, r }) => qual ? <td key={d.id}>{r.qual ?? "—"}</td> : [
                            <td key={d.id + 1} className={cls(r.mt1)}>{fmt(r.mt1)}</td>, <td key={d.id + 2} className={cls(r.mt2)}>{fmt(r.mt2)}</td>, <td key={d.id + 3} className={cls(r.mt3)}>{fmt(r.mt3)}</td>,
                            ...(exame ? [<td key={d.id + 5}>{fmt(r.exame)}</td>, <td key={d.id + 6} className={cls(r.cf)}><b>{fmt(r.cf)}</b></td>] : []),
                          ])}
                          {!qual && (() => { const g = mediaGeral(res.map((x) => ({ extra: x.extra, v: x.r.cf }))); return <td className={cls(g)}><b>{fmt(g)}</b></td>; })()}
                          <td><b>{fim?.texto ?? "—"}</b></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </>
              )}
            </table>
            {tipo !== "mini" && disciplinas.some((d) => d.extra) && <p style={{ fontSize: 10, marginTop: 4 }}>* Disciplina extra-curricular (não conta para o resultado).</p>}
            <div className="mt-8 flex justify-around">
              <Assinatura cargo="O Pedagógico" nome={inst?.pauta_pedagogico} />
              <Assinatura cargo="A Direcção" nome={inst?.pauta_direccao} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

