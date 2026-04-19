# Diretrizes de Design, UI e UX

## 1. Identidade Visual e Tema

* O design deve ser minimalista e focado na ferramenta (ferramenta de produtividade para músicos).
* Implementar suporte nativo a Dark Mode (preferencial) e Light Mode.
* Paleta de cores baseada em tons neutros (Slate ou Zinc do Tailwind), com uma cor primária de destaque (ex: um tom de Indigo ou Emerald) apenas para botões de ação principal (Exportar, Salvar).

## 2. Tipografia

* Fontes de Interface: Para menus, botões e labels, utilizar uma fonte Sans-serif moderna e legível (ex: Inter, Roboto ou o stack nativo do sistema).
* Símbolos da Tablatura: Sugere-se o uso de uma fonte Monospaced (ex: Fira Code, JetBrains Mono ou Courier New) exclusivamente para a representação visual dos símbolos textuais, como "X", "O", "x" e "o".
* Objetivo: Manter a estética tradicional das tablaturas musicais.
* Alinhamento Estrutural: É importante notar que, diferentemente de editores de texto puro, o alinhamento horizontal (tempo) e vertical (instrumentos) não depende da largura dos caracteres da fonte. Todo o posicionamento e a precisão rítmica são geridos matematicamente pela grade SVG e pelo sistema de snapping cartesiano.

## 3. Layout da Aplicação (UX)

* Terá uma landing page explicando a aplicação (com botão direcionando par ao editor) e a página do editor: A tela principal deve conter tudo o que o usuário precisa saber.
* **Header:** Logo simples à esquerda, e controles globais à direita (Tema Dark/Light).
* **Área Principal (Split/Grid):**
  * **Toolbar superior:** Botões de ação (Adicionar Compasso, Limpar, Exportar PDF, Exportar Imagem).
  * **Área de Edição:** Área de Edição: Uma grade vetorial (SVG) interativa onde o usuário posiciona os símbolos musicais utilizando drag and drop ou clique.
* **Feedback Visual:** Botões de exportação devem ter estados de `loading` e `success` para dar feedback claro ao usuário.
*

## 4. Framework CSS

* Utilizar Tailwind CSS para toda a estilização. Não criar arquivos `.css` personalizados a menos que seja estritamente necessário para a impressão (print media queries).

## 5. Escopo de Tela e Responsividade (Desktop-First MVP)
* **Foco do MVP:** A aplicação inicial é estritamente voltada para uso em Desktop (resolução mínima focada em telas > 1024px) para garantir precisão no drag-and-drop.
* **Preparo Futuro:** Embora o foco seja Desktop, as classes do Tailwind devem respeitar a convenção padrão (mobile-first), mas não é necessário investir tempo agora otimizando a interface para celulares.
* O Container do editor pode ter um `min-width` fixo com scroll horizontal na página, garantindo que a tablatura não quebre em telas menores durante testes.
