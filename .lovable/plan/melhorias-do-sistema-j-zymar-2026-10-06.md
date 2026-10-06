# Melhorias do sistema J. ZYMAR

## Objectivo
Melhorar o acesso, a segurança de utilização, os documentos escolares, o lançamento de notas e as estatísticas, mantendo o visual azul, azul-escuro e branco.

## Implementação

### 1. Entrada, cadastro e acesso
- Ocultar visualmente o selo `#lovable-badge` no site publicado.
- Reestruturar a página de entrada/cadastro com nome e logótipo da instituição, título “Iniciar Sessão” e botão para mostrar/ocultar a palavra-passe.
- Adicionar recuperação de palavra-passe com código de seis dígitos enviado ao email e definição de nova palavra-passe após validação.
- Substituir a saída imediata por confirmação explícita com “Sim” e “Não”.
- Melhorar o ecrã de conta pendente com acção para contactar o ADM pelo WhatsApp (+244 940 911 634), preenchendo nome e função; para encarregados, incluir os educandos já associados.

### 2. Alunos, turmas e estado de matrícula
- Acrescentar `turma` e estado `Activo/Desistente` ao cadastro e à listagem de alunos.
- Ajustar a numeração automática para que novos alunos comecem no ID 2600, preservando qualquer registo existente com número superior.
- Actualizar os tipos e leituras para estes novos dados.

### 3. Notas e pautas
- Manter o lançamento em lote: um único botão “Salvar notas na pauta trimestral” grava toda a turma e actualiza mini-pautas e boletins.
- Aplicar arredondamento e nomenclatura: mini-pauta com MF inteira; valores intermédios podem apresentar decimal.
- Aplicar cores consistentes em notas numéricas: azul para positiva e vermelho para negativa.
- Na pauta trimestral, acrescentar MFD geral ao lado do Resultado.
- Na pauta final, mostrar MT1, MT2, MT3 e MF dentro de cada disciplina; acrescentar MFD geral ao lado do Resultado Final.
- Centralizar os novos cálculos na regra de avaliação comum para manter notas, pautas e boletins coerentes.

### 4. Guardar documentos
- Criar uma acção reutilizável “Guardar” com opções Excel e Word.
- Aplicar à ficha do aluno, lista nominal, mini-pautas, pautas trimestrais/finais, boletins e mapas estatísticos.
- Os ficheiros guardados conservarão título, instituição, ano lectivo, cabeçalhos e dados visíveis do documento seleccionado.

### 5. Painel e estatísticas
- Acrescentar ao painel os totais de Professores e Alunos Avaliados.
- Criar Estatísticas, visível para ADM e Pedagógico, com selecção trimestral ou final.
- Apresentar por nível e classe: professores MF/F, turmas, matriculados MF/F, desistentes MF/F, avaliados MF/F, avaliados com aproveitamento MF/F e sem aproveitamento MF/F.
- Incluir subtotal de cada nível de ensino e total geral.
- Criar “Mapa Estatístico” do professor, limitado às suas disciplinas/turmas, com matriculados, aprovados, reprovados e desistentes em MF, F e percentagem.

## Segurança e dados
- As novas colunas obedecerão às permissões existentes: ADM/Pedagógico gerem alunos e estatísticas globais; professor vê apenas as atribuições autorizadas.
- A recuperação da palavra-passe só permitirá a alteração depois de o código enviado ao email ser validado.
- As exportações serão geradas no dispositivo do utilizador, sem enviar documentos escolares para serviços externos.

## Verificação
- Confirmar entrada, cadastro, recuperação por código, confirmação de saída e contacto WhatsApp.
- Confirmar cadastro a partir do ID 2600, turma e estado Activo/Desistente.
- Testar gravação única da turma, arredondamentos, cores e cálculos de MFD.
- Abrir ficheiros Excel e Word de cada tipo de documento.
- Validar estatísticas trimestrais/finais e mapa do professor em computador e telemóvel.
