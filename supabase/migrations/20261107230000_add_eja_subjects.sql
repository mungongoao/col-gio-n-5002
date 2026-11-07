-- Adiciona disciplinas do Ensino de Jovens e Adultos sem alterar as classes existentes.
-- O I.º Ano recebe a matriz de disciplinas da 7.ª classe; o II.º Ano, da 8.ª.
INSERT INTO public.subjects (classe, nome, extra, ordem)
SELECT 'EJA1', origem.nome, origem.extra, origem.ordem
FROM public.subjects AS origem
WHERE origem.classe = '7'
  AND NOT EXISTS (
    SELECT 1 FROM public.subjects AS destino
    WHERE destino.classe = 'EJA1'
      AND lower(destino.nome) = lower(origem.nome)
  );

INSERT INTO public.subjects (classe, nome, extra, ordem)
SELECT 'EJA2', origem.nome, origem.extra, origem.ordem
FROM public.subjects AS origem
WHERE origem.classe = '8'
  AND NOT EXISTS (
    SELECT 1 FROM public.subjects AS destino
    WHERE destino.classe = 'EJA2'
      AND lower(destino.nome) = lower(origem.nome)
  );
