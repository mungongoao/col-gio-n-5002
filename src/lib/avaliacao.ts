// Regras de avaliação (Ministério da Educação de Angola, ano lectivo 2026/2027)

export const CLASSES = ["7", "8", "9", "EJA1", "EJA2"] as const;
export type Classe = (typeof CLASSES)[number];

export const QUALITATIVOS = ["Regular", "Bom", "Excelente"] as const;

export function nomeClasse(c: string) {
  if (c === "EJA1") return "EJA - I° ano";
  if (c === "EJA2") return "EJA - II° ano";
  return `${c}ª Classe`;
}

export function cicloDe(c: string) {
  if (c === "EJA1" || c === "EJA2") return "Ensino de Jovens Adultos";
  return "I.º Ciclo do Ensino Secundário";
}

export const isQualitativa = (_c: string) => false;
export const escalaMax = (_c: string) => 20;
export const notaMinima = (c: string) => escalaMax(c) / 2;
export const isClasseExame = (c: string) => c === "9";
export const temExameOral = (disciplina: string) => /portugu|ingl/i.test(disciplina);

export const rotuloResultado = (c: string, ok: boolean) =>
  isClasseExame(c) ? (ok ? "Apto" : "Não Apto") : ok ? "Transita" : "Não Transita";

export type Nota = {
  trimestre: number;
  mac: number | null;
  npt: number | null;
  qualitativo: string | null;
  exame_escrito: number | null;
  exame_oral: number | null;
  faltas: number;
};

const r1 = (n: number) => Math.round(n * 10) / 10;

export function mediaTrimestral(n?: Pick<Nota, "mac" | "npt" | "trimestre"> | null, classe?: string): number | null {
  if (!n || n.mac == null) return null;
  // Nas classes de exame, a avaliação do 3.º trimestre é MACT3 e vale directamente.
  if (isClasseExame(classe ?? "") && n.trimestre === 3) return r1(Number(n.mac));
  if (n.npt == null) return null;
  return r1((Number(n.mac) + Number(n.npt)) / 2);
}

export function notaExame(n: Nota | undefined, disciplina: string): number | null {
  if (!n || n.exame_escrito == null) return null;
  if (temExameOral(disciplina)) {
    if (n.exame_oral == null) return null;
    return r1((Number(n.exame_escrito) + Number(n.exame_oral)) / 2);
  }
  return Number(n.exame_escrito);
}

export type ResumoDisciplina = {
  mt1: number | null;
  mt2: number | null;
  mt3: number | null;
  mfd: number | null;
  exame: number | null;
  mf: number | null;
  cf: number | null; // compatibilidade: alias de MF nas classes de exame
  qual: string | null; // reservado para compatibilidade
  positiva: boolean | null;
};

export function resumoDisciplina(classe: string, disciplina: string, notas: Nota[]): ResumoDisciplina {
  const t = (i: number) => notas.find((n) => n.trimestre === i);
  if (isQualitativa(classe)) {
    const qual = t(3)?.qualitativo ?? null;
    return { mt1: null, mt2: null, mt3: null, mfd: null, exame: null, mf: null, cf: null, qual, positiva: qual ? true : null };
  }
  const mt1 = mediaTrimestral(t(1));
  const mt2 = mediaTrimestral(t(2));
  const mt3 = mediaTrimestral(t(3), classe);
  const mfd = mt1 != null && mt2 != null && mt3 != null ? r1((mt1 + mt2 + mt3) / 3) : null;
  let exame: number | null = null;
  let mf: number | null = mfd;
  if (isClasseExame(classe)) {
    exame = notaExame(t(3), disciplina);
    mf = mfd != null && exame != null ? r1(0.6 * mfd + 0.4 * exame) : null;
  }
  return { mt1, mt2, mt3, mfd, exame, mf, cf: mf, qual: null, positiva: mf == null ? null : mf >= notaMinima(classe) };
}

/** Resultado final do aluno. Extra-curriculares não contam. */
export function resultadoFinal(classe: string, resumos: { extra: boolean; r: ResumoDisciplina }[]) {
  const curr = resumos.filter((x) => !x.extra);
  if (curr.length === 0 || curr.some((x) => x.r.positiva == null)) return null;
  const negativas = curr.filter((x) => !x.r.positiva).length;
  const limite = isClasseExame(classe) ? 0 : 2;
  return { ok: negativas <= limite, negativas, texto: rotuloResultado(classe, negativas <= limite) };
}

export function resultadoTrimestre(classe: string, medias: { extra: boolean; v: number | string | null }[]) {
  return resultadoTrimestreDetalhado(classe, medias, 0);
}

const DISCIPLINAS_REPROVACAO_DIRECTA = /^(l[ií]ngua portuguesa|portugu[eê]s|matem[aá]tica|educa[cç][aã]o f[ií]sica)$/i;

export function resultadoTrimestreDetalhado(
  classe: string,
  medias: { extra: boolean; v: number | string | null; disciplina?: string }[],
  faltas: number,
) {
  const curr = medias.filter((x) => !x.extra);
  if (curr.length === 0 || curr.some((x) => x.v == null)) return null;
  if (faltas > 20) return rotuloResultado(classe, false);
  if (isQualitativa(classe)) return rotuloResultado(classe, true);
  const negativas = curr.filter((x) => Number(x.v) < notaMinima(classe));
  const directa = negativas.some((x) => DISCIPLINAS_REPROVACAO_DIRECTA.test(x.disciplina?.trim() ?? ""));
  return rotuloResultado(classe, !directa && negativas.length <= 3);
}

export const fmt = (n: number | null | undefined) => (n == null ? "—" : String(n).replace(".", ","));

/** Média geral curricular: só existe quando todas as disciplinas têm nota. */
export function mediaGeral(valores: { extra: boolean; v: number | null }[]) {
  const curr = valores.filter((x) => !x.extra);
  if (!curr.length || curr.some((x) => x.v == null)) return null;
  return r1(curr.reduce((s, x) => s + (x.v ?? 0), 0) / curr.length);
}
export const classeNota = (classe: string, v: number | null | undefined) => v == null ? "" : v < notaMinima(classe) ? "neg" : "pos";
