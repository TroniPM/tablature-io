# Diretrizes de Estética e Polimento Visual (UI/UX)

Este documento define as regras de polimento, animações e estilo avançado para a aplicação. A interface deve transmitir a sensação de uma ferramenta de alta performance (estilo Notion, Linear ou Vercel), focada no Dark Mode.

## 1. Paleta de Cores e Fundo (Dark Mode Premium)

* **Fundo da Aplicação:** Não utilizar preto puro (`#000000`). Utilizar o fundo da paleta Tailwind `bg-slate-950` ou `bg-zinc-950` para maior conforto visual.
* **Cor de Destaque (Accent):** Escolher uma cor vibrante (ex: `emerald-400` ou `indigo-400`) estritamente para estados ativos (botões selecionados na toolbar, focus, ou feedback de sucesso).
* **Notas Musicais:** A cor padrão dos símbolos no SVG deve ser um cinza claro (`fill-slate-200`).

## 2. Hierarquia Visual da Grade (Grid SVG)

A música possui pulso, e a grade deve refletir isso para não confundir o baterista.

* **Linhas de Tempo Forte (Beats):** As linhas verticais que representam a cabeça dos tempos (ex: 1, 2, 3, 4) devem ser levemente mais espessas ou ter um cinza mais destacado (`stroke-slate-600`).
* **Linhas de Subdivisão:** As linhas verticais intermediárias (contratempos) devem ser muito sutis, utilizando opacidade reduzida ou pontilhado/tracejado (`stroke-dasharray="4"`, `stroke-slate-800`).

## 3. O Efeito "Glassmorphism" (Toolbar Flutuante)

A Toolbar não deve bloquear completamente a visão da partitura que está por baixo dela.

* Aplicar o efeito de vidro jateado utilizando as classes do Tailwind: `bg-slate-900/60`, `backdrop-blur-md`, com uma borda sutil `border border-slate-800`.
* Adicionar cantos arredondados (`rounded-xl` ou `rounded-2xl`) e uma sombra suave (`shadow-xl`).

## 4. Micro-interações e Hover (A Regra do "Ghost Note")

Esta é a interação visual mais importante do editor:

* **Previsão de Snapping (Ghost Note):** Quando o usuário estiver com uma ferramenta selecionada (ex: Prato) e passar o mouse sobre a grade SVG, o sistema DEVE renderizar uma prévia translúcida do símbolo na exata coordenada de snapping onde ele cairia se o usuário clicasse naquele momento.
* **Estilo do Ghost Note:** Usar baixa opacidade (ex: `opacity-30` ou classe equivalente do Tailwind) para deixar claro que é apenas um "fantasma" e não uma nota definitiva.

## 5. Animações e Transições

* **Evitar mudanças bruscas:** Sempre que uma nota for selecionada, deletada, ou quando um botão for "hovered", utilizar transições suaves do Tailwind (ex: `transition-all duration-200 ease-in-out`).
* **Nota Selecionada:** Quando o usuário clicar em uma nota já inserida na grade (para movê-la ou deletá-la), aplicar um leve filtro de brilho (`drop-shadow`) na cor de destaque para mostrar que ela está ativa.
