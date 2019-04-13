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
 * 
 * remove() - запускается при очистке родительского чанка, удаляет блок строки, ссылки на него и связь с чанком
 *  чтобы после того как будет удалена привязка к этому объекту из объекта чанка у него и объекта блока не было
 *  никаких связей
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
                {top, bottom, height} = viewPort;
            if (position.top < top) 
                viewPort.scrollTo(position.top);
            else if (position.bottom > bottom) 
                viewPort.scrollTo(position.bottom - height);

        } else {
            this.block.classList.remove('selected');
        }
    }

    get position(): IPosition {
        let oTop = this.block.offsetTop,
        oHeight = this.block.offsetHeight;
        return {
            top: oTop - 10,
            bottom: oTop + oHeight
        }
    }

    public remove() {
        this.chunk.removeRowFromView(this.block);
        this.block = null;
        this.chunk = null;
    }
}