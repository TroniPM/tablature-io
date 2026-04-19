# Diretrizes de Arquitetura e Tech Stack

## 1. Stack Base e Bibliotecas Extras
* **Framework:** Vue 3 (Composition API com `<script setup>`).
* **Estado e Persistência:** * Pinia para estado global.
  * `pinia-plugin-persistedstate` para persistência automática no localStorage.
* **Utilitários (Obrigatório):** Utilizar **@vueuse/core** para gerenciar eventos de ponteiro/interação (usePointer, useDraggable), drag-and-drop (`useDraggable`), e estados de interface.
* **Linguagem:** TypeScript com tipagem rigorosa para o domínio musical.

## 2. Gerenciamento de Estado

* Utilizar Pinia para gerenciar o estado global da tablatura atual.
* O estado deve armazenar a estrutura da música (título, andamento) e o array de linhas/compassos inseridos pelo usuário.

## 3. Renderização e Exportação (Regra Estrita: Uso de SVG)

* O app não terá backend (inicialmente, futuralmente essas informações ficarão salvas na conta do usuário). A geração de arquivos deve ocorrer no lado do cliente (Client-side rendering).
* **Motor de Renderização:** Toda a área de edição (grade e notas) DEVE ser construída exclusivamente com elementos **SVG** declarativos no template do Vue.
* **Proibição:** Não utilizar HTML Canvas. A manipulação de cada nota deve ser feita através de componentes Vue que renderizam tags SVG (ex: `<circle>`, `<path>`).
* **Exportação:**
  * PDF: Utilizar `jspdf` em modo vetorial (preservando a nitidez dos traços).
  * Imagem: Converter o SVG para Blob/DataURL no momento da exportação.

## 4. Estrutura de Pastas

* `/src/components`: Componentes reutilizáveis de UI (Button, Modal).
* `/src/features/editor`: Componentes específicos do domínio (TabArea, TabRow, ExportToolbar).
* `/src/stores`: Stores do Pinia.

## 5. Esquema de Dados (TypeScript Interface)
Para garantir consistência, o estado da tablatura deve seguir esta estrutura base:
```typescript
interface TabNote {
  id: string; // UUID para rastreamento no DOM
  instrument: 'HH' | 'SD' | 'BD' | 'CR' | 'T1' | 'T2' | 'FT';
  tick: number; // Posição rítmica (ex: 0, 0.25, 0.5...)
  symbol: 'x' | 'o' | '>' | '(x)';
}


