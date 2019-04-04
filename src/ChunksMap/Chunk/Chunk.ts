/**
 * IPosition - интерфейс для упрощения определения объекта позиции отображения относительно документа
 * 
 * класс Chunk - представляет собой модель блока чанка связанную с его отображением
 * 
 * @param index - индекс чанка
 * @param chunk - отображение чанка
 * @param selectCB - колбек который должен быть вызван при выборе строки
 * 
 * loaded - флаг того что чанк загружен и больше не является emptySpace
 * изначально чанк создается как emptySpace, для того чтобы иметь 
 * приближенный к реальности размер штатного скроллбара браузера
 * 
 * load() - возвращает промис который разрешится когда будут загружены строки чанка
 * этот промис создается один раз и если чанк уже загружается/загружен вернется этот же промис
 * 
 * get height - возвращает реальную высоту отображения
 * set height - устанавливает напрямую высоту незагруженным блокам, нужно для подгонки emptySpace
 * после догрузки
 * 
 * get position - возвращает положение отображения относительно документа
 * 
 * addRowToView(row: DataRow) - используется в конструкторе новой строки для вставки ее отображения 
 * в отображение чанка
 * 
 * getByPosition(position: number) - находит в чанке строку располагающуюся на позиции position
 */

import { getData } from "./DataLoad/DataLoad";
import { DataRow } from "./DataRow/DataRow";
import viewPort from '../../ViewPort/ViewPort';

export interface IPosition {
    top: number;
    bottom: number;
}

export class Chunk {
    private block: HTMLElement;

    public loaded: boolean = false;
    private loadPromise: Promise<boolean> = null;
    public index: number;
    public rows: DataRow[];
    public select(row:DataRow) {}

    constructor (index:number, chunk: HTMLElement, selectCB: (row:DataRow)=>void) {
        this.index = index;
        this.block = chunk;
        this.rows = [];
        this.select = selectCB;
    }

    public load():Promise<boolean>{
        if (!this.loadPromise) {
            this.loadPromise = new Promise((resolve, reject)=>{
        
                getData(this.index).then(
                    (data: string[])=>{
                        data.forEach(
                            (str: string, idx: number)=>this.rows.push(new DataRow(idx, str, this))
                        );
        
                        this.loaded = true;
                        this.block.style.removeProperty('height');
                        resolve(this.loaded);
                    },
                    ()=>reject()
                )
            });
        }
        return this.loadPromise;
    }

    get height():number{
        return this.block.getBoundingClientRect().height;
    }

    set height(h: number) {
        this.block.style.height = h + 'px';
    }

    get position(): IPosition {
        let rect = this.block.getBoundingClientRect();
        return {
            top: rect.top + viewPort.top,
            bottom: rect.top + viewPort.top + rect.height
        }
    }

    public addRowToView(row: HTMLElement) {
        this.block.appendChild(row);
    }

    public getByPosition(position: number): DataRow {
        for (let row of this.rows) {
            if (row.position.top <= position && row.position.bottom > position)
                return row;
        }

        return null;
    }

}
