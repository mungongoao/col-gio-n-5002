import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

// Chamado diariamente pelo agendador: elimina definitivamente os registos
// do Lixo cujo prazo de 15 dias terminou (alunos e utilizadores).
export const Route = createFileRoute("/api/public/jobs/purgar-lixo")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.rpc("purgar_lixo_expirado");
        if (error) return Response.json({ success: false, error: error.message }, { status: 500 });
        return Response.json({ success: true });
      },
    },
  },
});
