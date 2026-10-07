import type { Aluno } from "@/lib/dados";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
export function TurmaSelect({ alunos, value, onChange }: { alunos: Aluno[]; value: string; onChange: (v: string) => void }) {
  return <Select value={value} onValueChange={onChange}><SelectTrigger className="w-40"><SelectValue placeholder="Turma" /></SelectTrigger><SelectContent><SelectItem value="todas">Todas as turmas</SelectItem>{Array.from(new Set(alunos.map((a) => a.turma))).sort().map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>;
}