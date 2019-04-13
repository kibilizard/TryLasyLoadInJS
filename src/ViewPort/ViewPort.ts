import { IPosition } from "../ChunksMap/Chunk/Chunk";
import { Z_BLOCK } from "zlib";

 /**
  * Класс ViewPort - отображение текущего положения экрана
  * top - положение верхней границы экрана относительно документа
  * height - высота видимой области
  * bottom - положение нижней границы экрана относительно документа
  * nextPagePosition - положение соответствующее позиции конца следующей страницы 
  * prevPagePosition - положение соответствующее позиции начала предыдущей страницы
  * 
  * scrollCB - колбек для скроллинга
  * 
  * scrollBy, scrollTo - переопределение стандартных функций без положения по ширине, для удобства
  * 
  * Вызов scrollCB отложен на 20мс после последнего события скролла, чтобы лишний раз не пытаться грузить страницы,
  * но сделать это если скроллинг остановлен
  */
 
 class ViewPort {
    get top():number { return pageYOffset; }

    get height():number { 
        let height = document.documentElement.clientHeight || document.body.clientHeight;
        return height;
    }

    get bottom():number { return this.top + this.height;}

    get nextPagePosition():number {
        let position = this.bottom + this.height;
        let scrollH = document.documentElement.scrollHeight || document.body.scrollHeight;
        return position <= scrollH ? position : scrollH;
    }

    get prevPagePosition():number {
        let position = this.top - this.height;
        return position >=0 ? position : null;
    }

    get toUnloadPositions():IPosition {
        let top = this.prevPagePosition - this.height;
        let bottom = this.nextPagePosition + this.height;
        let scrollH = document.documentElement.scrollHeight || document.body.scrollHeight;

        top = top > 0 ? top : null;
        bottom = bottom < scrollH ? bottom : null;
        return {top, bottom};
    }

    private timeOut: number = null;
    private blocked: boolean = false;

    public scrollCB(){console.log('inner scroll cb')};

    constructor(){
        
        onscroll = (e)=>{
            if (this.blocked) {
                this.blocked = false;
                return;
            }
            this.timeOut && clearTimeout(this.timeOut);
            
            this.timeOut = setTimeout(()=>{
                this.timeOut = null;
                this.scrollCB();
            },200);
        };
    }

    public scrollBy(offset: number) {
        scrollBy(0,offset);
        this.blocked = true;
    }

    public scrollTo(position: number) {
        scrollTo(0,position);
        this.blocked = true;
    }
}

export default new ViewPort();