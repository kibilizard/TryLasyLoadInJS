import { Chunk } from "./ChunksMap/Chunk/Chunk";
import viewPort  from "./ViewPort/ViewPort";
import chunksMap from "./ChunksMap/ChunksMap"
import preloader from "./Preloader/Preloader";
import KeyController from "./KeyController/KeyController";

import './assets/main.css';

/** в данных пока пусто - поднимаем прелоадер */
preloader.on();

/**
 * колбек для скролла
 * при необходимости запускает догрузку чанков
 * 
 * чанк по позиции viewPort.top считается тем чанком который сейчас перед глазами, его догрузка в первую очередь
 * коррекция top нужна потому, что top нулевого чанка равен 10px изза margin строк
 * 
 * далее чистим чанки которые ушли за пределы видимости
 * 
 * следующим догружается если нужно чанк по viewPort.bottom, потому что это тоже чанк находящийся на экране 
 * в данный момент, после его загрузки можно скрывать прелоадер - видимая область заполнена данными
 * 
 * далее идет догрузка по необходимости чанков найденных по позиции следующей и предыдущей страниц, то есть 
 * они грузятся немного заранее, для того, чтобы не ждать их догрузки при перемещении по документу
 * 
 * после всех догрузок, если что-то было догружено и изменилась позиция текущего чанка - корректируем 
 * позицию viewPort
 * 
 */
let onScrollUpload = () =>  {
    let forLoad: Chunk[] = [];
    let startLoad = (position:number):Promise<boolean> => new Promise((resolve) => {
        let chunk = position ? chunksMap.getChunkByPosition(position) : null;

        if (chunk && !chunk.loaded && forLoad.indexOf(chunk) === -1) {
            forLoad.push(chunk);
            chunk.load().then(
                ()=>resolve(true),
                ()=>resolve(false)
            );
        } else resolve(true);
    });

    let top = viewPort.top;
    top = top < 10 ? 10: top;
    let curChunk = chunksMap.getChunkByPosition(top);
    let curChunkPosition = curChunk.position.top;
    let curChunkOffset = top - curChunk.position.top;

    if (!curChunk.loaded) {
        preloader.on();
        forLoad.push(curChunk);
    }

    chunksMap.unloadUnvisible();

    curChunk.load()
        .then( () => startLoad(viewPort.bottom) )
        .then(
            () => {
                preloader.off();
                startLoad(viewPort.nextPagePosition );
            }
        )
        .then( () => startLoad(viewPort.prevPagePosition) )
        .then(
            () => {
                if (forLoad.length && curChunkPosition !== curChunk.position.top) 
                    viewPort.scrollTo(curChunk.position.top + curChunkOffset);
            }
        )
}

/**
 * после инициализации chunksMap можно привязать обработчики на скролл и для клавишь и убрать прелоадер
 */
chunksMap.init().then(
    ()=>{
        viewPort.scrollCB = onScrollUpload;
        KeyController.keyMap
            .set('ArrowUp', ()=>chunksMap.prev())
            .set('Up', ()=>chunksMap.prev()) // для IE
            .set('ArrowDown', ()=>chunksMap.next())
            .set('Down', ()=>chunksMap.next()) // для IE
            .set('PageUp', ()=>chunksMap.prevPage())
            .set('PageDown', ()=>chunksMap.nextPage())
            .set('Home', ()=>chunksMap.first())
            .set('End', ()=>chunksMap.last());
        preloader.off();
    },
    ()=>{
        console.error('init of chunks failed');
    }
)
