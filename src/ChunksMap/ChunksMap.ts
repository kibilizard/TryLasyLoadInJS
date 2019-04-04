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
 *  остальных (emptySpace) равной нулевому, для имитации реального размера документа
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
 * resolveUnloadedHeight - пересчитать высоту для emptySpace-чанков как среднее от высот уже загруженных чанков
 *  для наибольшего соответствия положения штатного скроллбара реальным данным
 * 
 * set unloadedHeight - установить высоту всем emptySpace-чанкам
 * 
 * select(row:DataRow) - выбрать строку, вызывает сеттер selected у row чтобы прицепить класс, и устанавливает
 *  selected и selectedChunk
 * 
 */

import { DataRow } from "./Chunk/DataRow/DataRow";
import { Chunk } from "./Chunk/Chunk";
import { CHUNKS_COUNT } from "../constants";
import viewPort from '../ViewPort/ViewPort';

class ChunksMap {
    private chunks: Chunk[] = [];
    private selected: DataRow = null;
    private selectedChunk: Chunk = null;

    public init(): Promise<boolean> {
        return new Promise((resolve, reject)=>{

            let container = document.getElementById('container');
            let selectCB = (row: DataRow)=>this.select(row);
            
            for (let i = 0; i < CHUNKS_COUNT; i++) {
                let chunkBlock = document.createElement('div');
                container.appendChild(chunkBlock);
                chunkBlock.setAttribute('chunkId',i.toString());
                
                let chunk = new Chunk(i,chunkBlock, selectCB);
                this.chunks.push(chunk);
            }

            this.chunks[0].load().then(
                () => {
                    this.unloadedHeight = this.chunks[0].height;
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
            ()=>{
                this.resolveUnloadedHeight();
                this.select(nextChunk.rows[0]);
            });
    }

    public prev(){
        if(!this.selected) this.last();

        else if (this.selected.index > 0) this.select(this.selectedChunk.rows[this.selected.index - 1]);

        else if (this.selectedChunk.index > 0) {
            let prevChunk = this.chunks[this.selectedChunk.index - 1];
            prevChunk.load().then(
                ()=>{
                    this.resolveUnloadedHeight();
                    this.select(prevChunk.rows[prevChunk.rows.length - 1]);
                }
            );
        }
    }

    public last(){
        let lastChunk = this.chunks[this.chunks.length - 1];
        lastChunk.load().then(
            ()=>{
                this.resolveUnloadedHeight();
                this.select(lastChunk.rows[lastChunk.rows.length - 1]);
            }
        );
    }

    public first(){
        this.chunks[0].load().then(
            ()=>{
                this.resolveUnloadedHeight();
                this.select(this.chunks[0].rows[0]);
            }
        );
    }

    public nextPage(){
        let bottom = viewPort.nextPagePosition - 1;

        let chunk = this.getChunkByPosition(bottom);
        this.tryGetRowInChunk(bottom,chunk);
    }

    public prevPage(){
        let top = viewPort.prevPagePosition + 1;
        
        let chunk = this.getChunkByPosition(top);
        this.tryGetRowInChunk(top,chunk);
    }

    private tryGetRowInChunk(position: number, chunk: Chunk) {
        let chunkOldTop = chunk.position.top;
        chunk.load().then(()=>{
            this.resolveUnloadedHeight();
            position += chunk.position.top - chunkOldTop;
            let row = chunk.getByPosition(position);
            if (!row) {
                if (chunk.position.bottom < position ) 
                    this.tryGetRowInChunk(position,this.chunks[chunk.index + 1]);
                else if (chunk.position.bottom > position) 
                    this.tryGetRowInChunk(position, this.chunks[chunk.index -1]);
                else 
                    console.error('row not founded but chunk in right position');
            }
            else this.select(row);
        })
    }

    public getChunkByPosition(position: number): Chunk {
        for (let chunk of this.chunks) {
            if (chunk.position.top <= position && chunk.position.bottom > position)
                return chunk;
        }

        return null;
    }

    public resolveUnloadedHeight() {
        let loaded = this.chunks.filter((chunk)=>chunk.loaded);
        let newH = loaded.reduce((sum, curent) => sum + curent.height,0) / loaded.length;
        this.unloadedHeight = newH;
    }

    set unloadedHeight(height: number) {
        this.chunks
            .filter((chunk)=>!chunk.loaded)
            .forEach((chunk)=>chunk.height = height);
    }

    public select(row: DataRow) {
        if (this.selected) this.selected.selected = false;
        row.selected = true;

        this.selectedChunk = row.chunk;
        this.selected = row;
    }
}

export default new ChunksMap();