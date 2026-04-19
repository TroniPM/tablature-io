# Diretrizes de Domínio: Editor Visual de Tablatura

## 1. Sistema de Grade (Grid System)
* A tablatura deve ser tratada como um plano cartesiano (X, Y).
* O eixo Y representa a peça da bateria (ex: Linha superior = Crash, Linha inferior = Bumbo).
* O eixo X representa o tempo (estritamente vinculado ao BPM e ao compasso).
* **Snapping (Atração):** Os símbolos não podem ficar em "qualquer lugar". Eles devem "grudar" em subdivisões rítmicas (ex: semibreve, colcheia, semicolcheia) para garantir a precisão rítmica.

## 2. Dicionário de Símbolos Visuais
* **X:** Usado para pratos (Hi-hat, Crash, Ride).
* **Círculo Fechado (o):** Usado para tambores (Snare, Tom, Bass Drum).
* **Círculo com Acento (>):** Notas acentuadas.
* **Parênteses (x):** Ghost notes.

## 3. Mapeamento do Eixo Y (De cima para baixo)
* Linha 1 (Topo): CR (Crash Cymbal) e RD (Ride Cymbal)
* Linha 2: HH (Hi-Hat)
* Linha 3: T1 e T2 (Tom-toms)
* Linha 4: SD (Snare Drum / Caixa)
* Linha 5 (Base): BD (Bass Drum / Bumbo) e FT (Floor Tom)

## 4. Comportamento da Toolbar
* A Toolbar deve ser um componente flutuante (`position: absolute` ou `fixed`).
* Deve permitir o estado "Ativo": se eu clico no ícone da Caixa (SD), o cursor do mouse se transforma nesse ícone para que eu saia "carimbando" a tablatura.

