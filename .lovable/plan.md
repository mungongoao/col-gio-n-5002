# Gestão Pedagógica J. ZYMAR — nova versão com Lovable Cloud

Reconstruir o sistema como aplicação real, com login seguro e base de dados partilhada, mantendo o visual azul institucional.

## Perfis e permissões
- **ADM (Administrador)**: credenciar, revogar e eliminar utilizadores; cadastrar alunos; configurar dados da instituição.
- **Pedagógico**: credenciar e revogar (sem eliminar); cadastrar alunos; registar disciplinas por ciclo/classe.
- **Professor**: lançar notas e faltas das turmas/disciplinas atribuídas.
- Novos registos ficam "Pendentes" até serem credenciados.

## Páginas
1. **Início** — logótipo e nome da escola (das configurações).
2. **Configurações da Instituição** (ADM): República, Ministério, Direcção Municipal, Nome da escola, Logótipo (upload), Rodapé das Pautas (Pedagógico, Direcção), Rodapé do Boletim (Coord. Tarde, Coord. Manhã). Nomes impressos com linha de assinatura.
3. **Disciplinas** (Pedagógico): registo por ciclo e classe, com marca de extra-curricular.
4. **Cadastro de Alunos** (ADM e Pedagógico): ID, Nome, BI/Cédula, Telefone, Idade, Género, Classe; tabela paginada.
5. **Lista Nominal** — gerada automaticamente por classe, ordem alfabética (Nome, Género).
6. **Lançamento de Notas** — MAC, NPP/NPT por trimestre; escala conforme a classe.
7. **Pautas** — trimestrais e final, a partir da lista nominal, com cabeçalho e rodapé institucionais.
8. **Boletins** — I Trimestre, II Trimestre e Final (MFD = (MT1+MT2+MT3)/3), imprimíveis.
9. **Utilizadores** — gestão conforme permissões acima.

## Regras de avaliação
| Classe | Escala | Resultado |
|---|---|---|
| Iniciação | Qualitativa: Regular, Bom, Excelente | Transita / Não Transita |
| 1ª–5ª | 0–10 | Transita / Não Transita |
| 6ª | 0–10 | Apto / Não Apto |
| 7ª–8ª | 0–20 | Transita / Não Transita |
| 9ª | 0–20 | Apto / Não Apto |

- MT = média de MAC e provas do trimestre; MFD = (MT1+MT2+MT3)/3.
- Aprovação por disciplina: ≥5 (escala 0–10) ou ≥10 (0–20); Iniciação aprova com Bom ou Excelente... Regular também aprova (a confirmar).
- Disciplinas extra-curriculares aparecem no boletim mas não contam para o resultado final.
- Limite de disciplinas negativas para transitar: a definir com o utilizador (padrão: até 2 negativas no 7ª–8ª, 0 em classes de exame 6ª/9ª).

## Detalhes técnicos
- Lovable Cloud: auth email/senha, tabela `user_roles` separada com `has_role`, tabelas `institution_settings`, `subjects`, `students`, `grades`, `absences`, `teacher_assignments`; storage para logótipo; RLS por perfil.
- Primeiro utilizador registado torna-se ADM.
- Impressão via CSS `@media print` para pautas e boletins.
