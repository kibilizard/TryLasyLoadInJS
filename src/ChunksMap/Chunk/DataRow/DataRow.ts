/**
 * класс DataRow представляет собой модель блока строки связанную с ее отображением
 * 
 * @param idx - индекс строки в чанке
 * @param data - текст строки
 * @param chunk - чанк к которому принадлежит строка, нужен для связывания метода выбора строки, и 
 * вставки отображения
 * 
 * set selected - устанавливает и снимает класс selected отображению, при необходимости позиционирует
 * отображение так, чтобы оно было полностью на экране
 * 
 * position - возвращает текущую позицию отображения относительно документа
 *  в top добавляем 10 изза сдвига отображения, это нужно чтобы строку по нужной позиции всегда можно было найти
 */
import { Chunk, IPosition } from "../Chunk";
import viewPort from '../../../ViewPort/ViewPort';

export class DataRow {
    private block: HTMLElement;

    public index: number;
    public chunk: Chunk;

    constructor (idx: number,  data: string, chunk: Chunk) {
        this.index = idx;
        this.chunk = chunk;
                        
        this.block = document.createElement('div');
        this.block.innerText = data;
        this.chunk.addRowToView(this.block);
        this.block.setAttribute('rowInd',idx.toString());
        this.block.className = 'data-row';
        this.block.onclick = ()=>this.chunk.select(this);
    }
    
    set selected(sel: boolean) {
        if (sel) {
            this.block.classList.add('selected');

            let position = this.position,
                {top, bottom} = viewPort;
            if (position.top < top) {
                viewPort.scrollBy(position.top - top);
            } else if (position.bottom > bottom) {
                viewPort.scrollBy(position.bottom - bottom);
            }

        } else {
            this.block.classList.remove('selected');
        }
    }

    get position(): IPosition {
        let rect = this.block.getBoundingClientRect();
        return {
            top: rect.top + viewPort.top - 10,
            bottom: rect.top + viewPort.top + rect.height
        }
    }
}