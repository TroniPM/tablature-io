# Diretrizes de Interação e UX

## 1. Mecânica de Posicionamento

* **Modo A (Drag & Drop):** O usuário arrasta um clone/fantasma do símbolo da Toolbar para a grade. Ao soltar, calcular a posição X mais próxima da grade rítmica e a posição Y mais próxima da linha do instrumento.
* **Modo B (Stamp Mode):** Selecionar símbolo na toolbar e clicar na grade para fixar.
* **Pointer Events:** Utilizar `PointerEvents` (ao invés de MouseEvents) para garantir que o drag-and-drop e o modo "carimbo" funcionem tanto em Desktop quanto em dispositivos Touch.
* **Snapping Inteligente:** Ao soltar uma nota, o sistema deve calcular a coordenada `tick` (X) e `instrument` (Y) mais próxima, baseada no tamanho da grade SVG definida.

## 2. Manipulação de Objetos

* Cada nota colocada na tablatura deve ser um objeto individual.
* Ao clicar em uma nota já colocada:
  * Mostrar opção de deletar (tecla Del ou ícone de lixo).
  * Permitir arrastar para mudar o tempo (X) ou o instrumento (Y).

## 3. Toolbar Flutuante

* Implementar um "handle" (alça) para arrasto da toolbar.
* Salvar a posição da toolbar no `localStorage` para que ela permaneça onde o usuário a deixou após o refresh.


## 4. Persistência e Recuperação
* **Auto-Save:** Qualquer alteração na tablatura (adicionar, mover ou deletar nota) deve disparar a persistência imediata no `localStorage`.
* **Estado Inicial:** Ao abrir o editor, o app deve verificar se existe uma tablatura salva e carregá-la automaticamente.
* **Histórico (Undo/Redo):** Implementar um stack de histórico para permitir desfazer (Ctrl+Z) e refazer (Ctrl+Y) as ações de edição na grade.

## 5. Toolbar Flutuante (Persistência)
* A posição (x, y) da Toolbar deve ser reativa.
* Utilizar `useLocalStorage` do VueUse para que, se o usuário mover a toolbar para o canto inferior direito, ela permaneça lá em futuras sessões.