# Ajustes de impressão, avaliação e perfil do encarregado

## Resultado esperado
- Manter a interface institucional do código actualizado em azul, azul-escuro e branco.
- Imprimir boletins em A5; ficha do aluno, lista nominal e mini-pautas em A4; pautas trimestrais e finais em A3, sempre ajustadas à folha.
- Acrescentar o perfil **Encarregado de Educação**, com acesso apenas ao aproveitamento percentual e às faltas dos educandos associados.
- Permitir aos professores consultar as pautas trimestrais das classes do seu ciclo, sem lhes dar acesso de edição adicional.
- Reservar o lançamento de faltas ao ADM e aos Coordenadores.
- Aplicar os novos critérios trimestrais sem alterar a regra final anual já definida.

## Alterações
1. **Regras de avaliação**
   - Centralizar em `avaliacao.ts` a reprovação trimestral por mais de 20 faltas.
   - Reprovar com mais de 3 médias negativas.
   - Fazer Língua Portuguesa, Matemática ou Educação Física negativas causarem reprovação directa.
   - Manter no resultado anual: até 2 negativas nas classes sem exame; zero negativas na 6.ª e 9.ª para “Apto”.

2. **Permissões e dados**
   - Adicionar o papel `encarregado` e uma associação segura entre encarregado e aluno.
   - Criar regras de acesso para o encarregado consultar somente os dados dos próprios educandos.
   - Criar uma operação segura para ADM/Pedagógico associar ou remover educandos no perfil do encarregado.
   - Separar a permissão de lançar notas da permissão de lançar faltas: ADM e Coordenador alteram faltas; professores continuam limitados às disciplinas atribuídas.
   - Autorizar professores a ler as pautas trimestrais das classes abrangidas pelas suas disciplinas atribuídas.

3. **Ecrãs**
   - Incluir “Encarregado de Educação” no registo e na gestão de utilizadores.
   - Na gestão de utilizadores, permitir ao ADM/Pedagógico escolher os educandos de cada encarregado.
   - Criar uma página simples para o encarregado ver, por filho, a percentagem de aproveitamento e o total de faltas.
   - Ajustar menus e visibilidade para cada perfil.

4. **Impressão**
   - Aplicar classes de folha distintas por documento e orientação adequada.
   - A4 ajustado para ficha, lista nominal e mini-pauta; A3 ajustado para pautas trimestrais/finais; A5 para boletins.
   - Garantir quebra por documento/aluno e ocultar os controlos durante a impressão.

5. **Verificação**
   - Validar a aplicação e testar as vistas de impressão e os principais acessos em tamanho de computador e telemóvel.

## Detalhes técnicos
- A alteração da base de dados será aditiva: novo valor no enum de papéis, tabela de associações encarregado–aluno, funções de permissão e políticas de acesso.
- A percentagem de aproveitamento será calculada apenas sobre disciplinas curriculares com avaliação disponível: disciplinas positivas ÷ disciplinas avaliadas × 100.
- “Mais de 20” e “mais de 3” serão aplicados literalmente como `> 20` e `> 3`.
