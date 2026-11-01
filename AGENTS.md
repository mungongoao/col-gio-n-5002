<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Evaluation rules (scales, MT/MFD/CF, Transita/Apto) live only in src/lib/avaliacao.ts — pages, pautas and boletins must reuse them so all documents agree.
- Permissions are enforced in the database (has_role/is_staff/can_grade RLS + credenciar/revogar RPCs); UI checks only hide controls.
- Logo is stored as a data URL in institution_settings (single row id=1) — avoids a storage bucket for one small image.
- User deletion goes through a server function with the admin client after an ADM role check.
- Guardian access is modelled through guardian_students and protected by row-level policies; never expose unrelated students or grades.
- Grade-field protection is enforced by a database trigger: only ADM and Coordenador may change absences, while grade permissions remain separate.
- Teacher assignments store a turma array per subject; an empty array preserves legacy all-turma access, and grade write policies validate the student turma to prevent cross-turma edits.
- First-entry navigation runs once in the root client effect, preserving recovery callbacks and authenticated internal refreshes; it is navigation policy, not an authentication guard.
- Student registration validation and turma options live in src/lib/gestao.ts; retired personal columns remain empty for live-client compatibility and are not queried by the application.
