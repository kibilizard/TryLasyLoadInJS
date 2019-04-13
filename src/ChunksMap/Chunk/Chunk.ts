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
 * unload() - очищает чанк, удаляет все строки и ссылки на них, ставит статус "незагружен", 
 * очищает промис загрузки и ставит высоту равную выбранной относительно браузера высоте emptySpace
 * 
 * get height - возвращает реальную высоту отображения
 * set height - устанавливает напрямую высоту незагруженным блокам, нужно установки высоты emptySpace
 * 
 * get position - возвращает положение отображения относительно документа
 * 
 * addRowToView(row: DataRow) - используется в конструкторе новой строки для вставки ее отображения 
 * в отображение чанка
 * 
 * removeRowFromView(roe: DataRow) - используется для очистки чанка в объекте DataRow для правильного,
 *  поддерживаемого всеми браузерами удаления блока строки
 * 
 * getByPosition(position: number) - находит в чанке строку располагающуюся на позиции position
 */

import { getData } from "./DataLoad/DataLoad";
import { DataRow } from "./DataRow/DataRow";
import { EMPTY_SPACE_HEIGHT } from "../../constants";

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
                    (data: string[]) => {
                        data.forEach(
                            (str: string, idx: number)=>this.rows.push(new DataRow(idx, str, this))
                        );
        
                        this.loaded = true;
                        this.block.style.removeProperty('height');
                        this.block.style.removeProperty('min-height');
                        resolve(this.loaded);
                    },
                    ()=>reject()
                )
            });
        }
        return this.loadPromise;
    }

    public unload() {
        this.rows.forEach((row)=>row.remove());
        this.rows = [];
        this.loaded = false;
        this.loadPromise = null;
        this.height = EMPTY_SPACE_HEIGHT;

    }

    get height():number{
        return this.block.offsetHeight;
    }

    set height(h: number) {
        this.block.style.height = h + 'px';
        this.block.style.minHeight = h + 'px';
    }

    get position(): IPosition {
        let oTop = this.block.offsetTop,
        oHeight = this.block.offsetHeight;
        return {
            top: oTop,
            bottom: oTop + oHeight
        }
    }

    public addRowToView(row: HTMLElement) {
        this.block.appendChild(row);
    }

    public removeRowFromView(row: HTMLElement) {
        this.block.removeChild(row);
    }

    public getByPosition(position: number): DataRow {
        for (let row of this.rows) {
            if (row.position.top <= position && row.position.bottom > position)
                return row;
        }

        return null;
    }

}
