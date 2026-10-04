import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Printer } from "lucide-react";
import { useAlunos, useDisciplinas, useInstituicao, useMe, useNotasClasse, type Aluno } from "@/lib/dados";
import {
  fmt, isClasseExame, isQualitativa, mediaTrimestral, nomeClasse, notaMinima, resultadoFinal, resultadoTrimestre, resumoDisciplina,
} from "@/lib/avaliacao";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Assinatura, ClasseSelect, DocCabecalho, PageTitle } from "@/components/escola";

export const Route = createFileRoute("/_authenticated/boletins")({
  head: () => ({ meta: [{ title: "Boletins — J. ZYMAR" }, { name: "description", content: "Boletins trimestrais e final." }] }),
  component: Boletins,
});

function Boletins() {
  const { data: me } = useMe();
  const [classe, setClasse] = useState("1");
  const [tipo, setTipo] = useState("1");
  const [aluno, setAluno] = useState("todos");
  const { data: inst } = useInstituicao();
  const { data: disciplinas = [] } = useDisciplinas(classe);
  const { data: alunos = [] } = useAlunos(classe);
  const { data: notas = [] } = useNotasClasse(classe);
  const lista = aluno === "todos" ? alunos : alunos.filter((a) => String(a.id) === aluno);

  return (
    <div>
      <PageTitle title="Boletins de Notas">
        <ClasseSelect value={classe} onChange={(v) => { setClasse(v); setAluno("todos"); }} />
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Iº Trimestre</SelectItem>
            <SelectItem value="2">IIº Trimestre</SelectItem>
            <SelectItem value="3">IIIº Trimestre</SelectItem>
            <SelectItem value="final">Boletim Final</SelectItem>
          </SelectContent>
        </Select>
        <Select value={aluno} onValueChange={setAluno}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os alunos</SelectItem>
            {alunos.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        {me?.podeImprimirBoletim && (
          <Button onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Imprimir / PDF (A5)</Button>
        )}
      </PageTitle>
      {!me?.podeImprimirBoletim && <p className="mb-4 text-sm text-muted-foreground print:hidden">Apenas os Coordenadores e o ADM podem imprimir boletins.</p>}
      <div className={me?.podeImprimirBoletim ? "print-area" : "print:hidden"}>
        <div className="flex flex-wrap gap-6">
          {lista.map((a, i) => (
            <Boletim key={a.id} n={alunos.indexOf(a) + 1 || i + 1} aluno={a} classe={classe} tipo={tipo} inst={inst} disciplinas={disciplinas} notas={notas} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Boletim({ aluno, n, classe, tipo, inst, disciplinas, notas }: {
  aluno: Aluno; n: number; classe: string; tipo: string;
  inst: ReturnType<typeof useInstituicao>["data"];
  disciplinas: ReturnType<typeof useDisciplinas>["data"] & object;
  notas: ReturnType<typeof useNotasClasse>["data"] & object;
}) {
  const qual = isQualitativa(classe);
  const exame = isClasseExame(classe);
  const min = notaMinima(classe);
  const cls = (v: number | null) => (v != null && v < min ? "neg" : "");
  const nd = (sid: string) => notas.filter((x) => x.student_id === aluno.id && x.subject_id === sid);
  const titulo = tipo === "final" ? "Boletim Final" : `Boletim de Notas — ${["I", "II", "III"][Number(tipo) - 1]}º Trimestre`;

  let resultado: string | null = null;
  const linhas = disciplinas.map((d) => {
    const ns = nd(d.id);
    if (tipo === "final") return { d, r: resumoDisciplina(classe, d.nome, ns), n: undefined };
    return { d, r: null, n: ns.find((x) => x.trimestre === Number(tipo)) };
  });
  if (tipo === "final") resultado = resultadoFinal(classe, linhas.map((l) => ({ extra: l.d.extra, r: l.r! })))?.texto ?? null;
  else resultado = resultadoTrimestre(classe, linhas.map((l) => ({ extra: l.d.extra, v: qual ? l.n?.qualitativo ?? null : mediaTrimestral(l.n) })));
  const faltas = notas.filter((x) => x.student_id === aluno.id && (tipo === "final" || x.trimestre === Number(tipo))).reduce((s, x) => s + (x.faltas ?? 0), 0);

  return (
    <div className="doc doc-a5 shadow">
      <DocCabecalho inst={inst} titulo={titulo} sub={`Ano lectivo ${inst?.ano_lectivo ?? ""}`} />
      <div style={{ fontSize: 11, marginBottom: 6 }}>
        <div><b>Nome:</b> {aluno.nome}</div>
        <div><b>Classe:</b> {nomeClasse(classe)} &nbsp; <b>Nº:</b> {n} &nbsp; <b>Género:</b> {aluno.genero} &nbsp; <b>Idade:</b> {aluno.idade ?? ""}</div>
      </div>
      <table>
        <thead>
          {tipo === "final" ? (
            <tr><th>Disciplina</th>{qual ? <th>Avaliação</th> : <><th>MT1</th><th>MT2</th><th>MT3</th><th>MFD</th>{exame && <><th>Exame</th><th>CF</th></>}</>}</tr>
          ) : (
            <tr><th>Disciplina</th>{qual ? <th>Avaliação</th> : <><th>MAC</th><th>NPT</th><th>MT{tipo}</th></>}<th>Faltas</th></tr>
          )}
        </thead>
        <tbody>
          {linhas.map(({ d, r, n: nn }) => (
            <tr key={d.id}>
              <td className="esq">{d.nome}{d.extra ? "*" : ""}</td>
              {tipo === "final" ? (
                qual ? <td>{r!.qual ?? "—"}</td> : <>
                  <td>{fmt(r!.mt1)}</td><td>{fmt(r!.mt2)}</td><td>{fmt(r!.mt3)}</td><td className={cls(r!.mfd)}><b>{fmt(r!.mfd)}</b></td>
                  {exame && <><td>{fmt(r!.exame)}</td><td className={cls(r!.cf)}><b>{fmt(r!.cf)}</b></td></>}
                </>
              ) : (
                <>
                  {qual ? <td>{nn?.qualitativo ?? "—"}</td> : <>
                    <td>{fmt(nn?.mac)}</td><td>{fmt(nn?.npt)}</td><td className={cls(mediaTrimestral(nn))}><b>{fmt(mediaTrimestral(nn))}</b></td>
                  </>}
                  <td>{nn?.faltas ?? 0}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ fontSize: 11, marginTop: 6 }}>
        <div><b>Total de faltas:</b> {faltas}</div>
        <div><b>Resultado:</b> {resultado ?? "—"}</div>
        {disciplinas.some((d) => d.extra) && <div style={{ fontSize: 9 }}>* Extra-curricular (não conta para o resultado).</div>}
      </div>
      <div className="mt-6 flex justify-between">
        <Assinatura cargo="O Coordenador da Manhã" nome={inst?.boletim_coord_manha} />
        <Assinatura cargo="O Coordenador da Tarde" nome={inst?.boletim_coord_tarde} />
      </div>
    </div>
  );
}
