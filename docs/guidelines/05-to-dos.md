* **Feedback Sonoro (Web Audio API):** Quando o usuário arrastar um "Bumbo" e soltar na linha, o app deve tocar um sample curto de bumbo. Isso valida a ação visual com uma resposta auditiva.

* **Histórico (Undo/Redo):** Em editores visuais, o usuário erra muito o clique. Ter um undo/redo (pode usar o useRefHistory do VueUse ou lógica manual na Store) é essencial.

* **Linha de Reprodução (Playhead):** Uma linha vertical que percorre a tablatura visualmente se o usuário der "Play" (mesmo que sem som inicialmente, apenas para conferir o ritmo).

  
* **Sistema de Camadas (Layers):** Trate as linhas da tablatura como o 'Fundo' e as notas como 'Elementos Vetoriais' em SVG. SVG costuma ser melhor para exportação de alta qualidade (PDF).
