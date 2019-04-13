/**
 * объект ChunksMap - для управления объектами чанков и строк в них
 * 
 * chunks - все чанки, как загруженные так и emptySpace
 * selected - текущая выбранная строка
 * selectedChunk - чанк в которой расположена текущая выбранная строка
 * 
 * init() - инициализация
 *  создает все CHUNKS_COUNT чанков, сначала все пустые
 *  запускает загрузку нулевого чанка, и по его загрузке ставит высоту всех 
 *  остальных (emptySpace) равной выбранной в зависимости от браузера высоте EmptySpace
 * 
 * next() - выбрать следующую за выбранной (или первую) строку, при необходимости 
 *  запускает догрузку следующего чанка
 * 
 * prev() - выбрать предыдущую (или последнюю) строку, при необходимости 
 *  запускает догрузку предыдущего чанка
 * 
 * last() - выбрать последнюю строку, при необходимости догружает последний чанк
 * 
 * first() - выбрать первую строку, при необходимости загружает нулевой чанк
 * 
 * nextPage() - выбрать последнюю строку следующей страницы
 * prevPage() - выбрать первую строку предыдущей страницы
 * tryGetRowInChunk() - иногда после догрузки искомые строки уже не попадают в найденый
 *  изначально чанк, поэтому корректируем чанк по позиции и ищем в нем если не нашлось
 * 
 * getChunkByPosition - найти чанк располагающийся на определенной высоте относительно документа
 * 
 * unloadUnvisible - находит и чистит чанки которые оказались дальше чем за 2 страницы от viewPort
 * 
 * select(row:DataRow) - выбрать строку, вызывает сеттер selected у row чтобы прицепить класс, и устанавливает
 *  selected и selectedChunk, после выбора и соответственно скроллинга до строки запускает удаление 
 *  чанков за пределами видимости, если нужно еще раз корректирует позицию
 * 
 * cleanSelect - очищаем предыдущую выбранную строк, нужно для ситуации когда очищается чанк в котором 
 *  была эта строка и ее больше нет в документе
 * 
 */

import { DataRow } from "./Chunk/DataRow/DataRow";
import { Chunk, IPosition } from "./Chunk/Chunk";
import { CHUNKS_COUNT, EMPTY_SPACE_HEIGHT } from "../constants";
import viewPort from '../ViewPort/ViewPort';

class ChunksMap {
    private chunks: Chunk[] = [];
    private selected: DataRow = null;
    private selectedChunk: Chunk = null;

    public init(): Promise<boolean> {
        return new Promise((resolve, reject)=>{

            let container = document.body;
            let selectCB = (row: DataRow)=>this.select(row);
            
            for (let i = 0; i < CHUNKS_COUNT; i++) {
                let chunkBlock = document.createElement('div');
                container.appendChild(chunkBlock);
                chunkBlock.setAttribute('chunkId',i.toString());
                chunkBlock.className = 'data-chunk';
                
                let chunk = new Chunk(i,chunkBlock, selectCB);
                this.chunks.push(chunk);
            }

            this.chunks[0].load().then(
                () => {
                    this.chunks
                    .filter((chunk)=>!chunk.loaded)
                    .forEach((chunk)=>chunk.height = EMPTY_SPACE_HEIGHT);

                    resolve(true);
                }, reject);
        })
    }

    public next() {
        if (!this.selected) {
            this.first();
            return;
        }

        let nextInChunk = this.selectedChunk.rows[this.selected.index + 1] || null;
        if (nextInChunk) {
            this.select(nextInChunk);
            return;
        }
        
        let nextChunk = this.chunks[this.selectedChunk.index +1] || null;

        if (nextChunk) nextChunk.load().then(
            ()=>this.select(nextChunk.rows[0]));
    }

    public prev(){
        if(!this.selected) this.last();

        else if (this.selected.index > 0) this.select(this.selectedChunk.rows[this.selected.index - 1]);

        else if (this.selectedChunk.index > 0) {
            let prevChunk = this.chunks[this.selectedChunk.index - 1];
            prevChunk.load().then(
                ()=>this.select(prevChunk.rows[prevChunk.rows.length - 1])
            );
        }
    }

    public last(){
        let lastChunk = this.chunks[this.chunks.length - 1];
        lastChunk.load().then( () => this.select(lastChunk.rows[lastChunk.rows.length - 1]) );
    }

    public first(){
        this.chunks[0].load().then( () => this.select(this.chunks[0].rows[0]) );
    }

    public nextPage(){
        let bottom = viewPort.nextPagePosition - 1;

        let chunk = this.getChunkByPosition(bottom);
        this.tryGetRowInChunk(bottom,chunk);
    }

    public prevPage(){
        let top = viewPort.prevPagePosition + 1;
        
        let chunk = this.getChunkByPosition(top);
        this.tryGetRowInChunk(top, chunk, true);
    }

    private tryGetRowInChunk(position: number, chunk: Chunk, toPrev: boolean = false) {
        let chunkOldTop  = chunk.position.top;
        let chunkOldHeight = chunk.height;

        chunk.load().then(()=>{
            let {top, bottom} = chunk.position;
            position += top - chunkOldTop;

            /**
             * в IE/Edge может получиться так, что после загрузки чанка, 
             * искомая строка будет ниже viewPort - корректируем
             *  */ 
            if (toPrev) { 
                let offset = chunk.height - chunkOldHeight;
                if (bottom >= viewPort.top) viewPort.scrollBy(offset);
                position += offset;
            }

            let row = chunk.getByPosition(position);
            if (!row) {
                if (chunk.position.bottom < position ) 
                    this.tryGetRowInChunk(position,this.chunks[chunk.index + 1], toPrev);
                else if (chunk.position.bottom > position) 
                    this.tryGetRowInChunk(position, this.chunks[chunk.index -1], toPrev);
                else 
                    console.error('row not founded but chunk in right position');
            }
            else {
                this.select(row);
                this.unloadUnvisible();
            }
        })
    }

    public getChunkByPosition(position: number): Chunk {
        for (let chunk of this.chunks) {
            if (chunk.position.top <= position && chunk.position.bottom > position)
                return chunk;
        }

        return null;
    }

    public unloadUnvisible(): boolean {
        let removePosition = viewPort.toUnloadPositions;
        let toRemove: Chunk[] = [];
        this.chunks
            .filter((chunk) => chunk.loaded)
            .forEach((chunk) => {
                let position = chunk.position;
                if (
                    (!!removePosition.top && (position.bottom <= removePosition.top)) || 
                    (!!removePosition.bottom && (position.top >= removePosition.bottom))
                    ) {
                    toRemove.push(chunk);;
                    if (this.selectedChunk === chunk) this.cleanSelect();
                }
            })

        toRemove.forEach((chunk) => chunk.unload());

        return toRemove.length > 0;
    }

    public select(row: DataRow) {
        if (this.selected) this.selected.selected = false;

        this.selectedChunk = row.chunk;
        this.selected = row;

        row.selected = true;

        let rowOffset = row.position.top - viewPort.top;
        
        if (this.unloadUnvisible()) {
            let newPosition = row.position.top - rowOffset;
            if (viewPort.top !== newPosition) viewPort.scrollTo(newPosition);
        }

    }

    private cleanSelect() {
        this.selectedChunk = null;
        this.selected = null;
    }
}

export default new ChunksMap();