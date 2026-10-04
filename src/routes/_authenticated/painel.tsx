import { createFileRoute } from "@tanstack/react-router";
import { useAlunos, useDisciplinas, useInstituicao, useMe } from "@/lib/dados";
import { Card, CardContent } from "@/components/ui/card";
import { PageTitle } from "@/components/escola";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({ meta: [{ title: "Painel — J. ZYMAR" }, { name: "description", content: "Resumo do sistema pedagógico." }] }),
  component: Painel,
});

function Painel() {
  const { data: me } = useMe();
  const { data: inst } = useInstituicao();
  const { data: alunos } = useAlunos();
  const { data: disc } = useDisciplinas();
  const m = alunos?.filter((a) => a.genero === "M").length ?? 0;
  const stats = [
    { l: "Alunos matriculados", v: alunos?.length ?? 0 },
    { l: "Masculino / Feminino", v: `${m} / ${(alunos?.length ?? 0) - m}` },
    { l: "Disciplinas registadas", v: disc?.length ?? 0 },
    { l: "Ano lectivo", v: inst?.ano_lectivo ?? "" },
  ];
  return (
    <div>
      <PageTitle title={`Bem-vindo(a), ${me?.profile?.nome ?? ""}`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.l}><CardContent className="p-5">
            <div className="text-sm text-muted-foreground">{s.l}</div>
            <div className="mt-2 text-3xl font-semibold text-primary">{s.v}</div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}
