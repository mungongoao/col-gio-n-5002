import { describe, expect, it } from "vitest";
import { mediaTrimestral, resumoDisciplina, resultadoFinal, escalaMax, notaMinima, cicloDe, nomeClasse, type Nota } from "@/lib/avaliacao";

const nota = (trimestre: number, mac: number | null, npt: number | null, exame: number | null = null): Nota => ({
  trimestre, mac, npt, qualitativo: null, exame_escrito: exame, exame_oral: null, faltas: 0,
});

describe("regras de avaliação das classes com exame", () => {
  it("calcula MT1 e MT2 pela média de MAC e NPT", () => {
    expect(mediaTrimestral(nota(1, 6, 8), "9")).toBe(7);
    expect(mediaTrimestral(nota(2, 8, 10), "9")).toBe(9);
  });

  it("usa MACT3 directamente como MT3 e ignora NPT antigo sem o apagar", () => {
    expect(mediaTrimestral(nota(3, 7.5, 9, 10), "9")).toBe(7.5);
  });

  it("calcula MFD e MF ponderada a 60/40 na 9.ª classe", () => {
    const r = resumoDisciplina("9", "Matemática", [
      nota(1, 6, 6), nota(2, 8, 8), nota(3, 10, 4, 10),
    ]);
    expect(r.mfd).toBe(8);
    expect(r.exame).toBe(10);
    expect(r.mf).toBe(8.8);
    expect(r.positiva).toBe(true);
  });

  it("aplica escala de 0 a 20 e aprovação mínima de 10 na 9.ª classe", () => {
    const r = resumoDisciplina("9", "Matemática", [
      nota(1, 12, 14), nota(2, 14, 16), nota(3, 16, 2, 10),
    ]);
    expect(r.mt3).toBe(16);
    expect(r.mfd).toBe(14.7);
    expect(r.mf).toBe(12.8);
    expect(r.positiva).toBe(true);
  });

  it("só declara o resultado final quando todas as disciplinas curriculares têm notas", () => {
    const aprovada = resumoDisciplina("9", "Matemática", [
      nota(1, 6, 6), nota(2, 8, 8), nota(3, 10, 0, 10),
    ]);
    expect(resultadoFinal("9", [{ extra: false, r: aprovada }])?.texto).toBe("Apto");
    expect(resultadoFinal("9", [{ extra: false, r: { ...aprovada, mf: null, cf: null, positiva: null } }])).toBeNull();
  });
});

describe("Ensino de Jovens Adultos", () => {
  it("usa no I.º Ano os critérios da 7.ª classe, sem exame", () => {
    expect(cicloDe("EJA1")).toBe("Ensino de Jovens Adultos");
    expect(nomeClasse("EJA1")).toContain("I.º Ano");
    expect(escalaMax("EJA1")).toBe(20);
    expect(notaMinima("EJA1")).toBe(10);
    const r = resumoDisciplina("EJA1", "Matemática", [
      nota(1, 12, 14), nota(2, 14, 16), nota(3, 16, 18),
    ]);
    expect(r.mt3).toBe(17);
    expect(r.mf).toBe(r.mfd);
    expect(r.exame).toBeNull();
  });

  it("usa no II.º Ano os critérios da 8.ª classe, sem exame", () => {
    expect(cicloDe("EJA2")).toBe("Ensino de Jovens Adultos");
    expect(escalaMax("EJA2")).toBe(20);
    expect(notaMinima("EJA2")).toBe(10);
    const r = resumoDisciplina("EJA2", "Língua Portuguesa", [
      nota(1, 10, 12), nota(2, 12, 14), nota(3, 14, 16),
    ]);
    expect(r.mf).toBe(r.mfd);
    expect(r.exame).toBeNull();
  });
});
