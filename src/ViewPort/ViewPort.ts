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

    get height():number { return document.documentElement.clientHeight;}

    get bottom():number { return this.top + this.height;}

    get nextPagePosition():number {
        let position = this.bottom + this.height;
        return position <= document.body.scrollHeight ? position : document.body.scrollHeight;
    }

    get prevPagePosition():number {
        let position = this.top - this.height;
        return position >=0 ? position : 0;
    }

    private scrollTO: number = null;

    public scrollCB(){console.log('inner scroll cb')};

    constructor(){
        
        onscroll = (e)=>{
            this.scrollTO && clearTimeout(this.scrollTO);
            
            this.scrollTO = setTimeout(()=>{
                this.scrollTO = null;
                this.scrollCB();
            },20);
        };
    }

    public scrollBy(offset: number) {
        scrollBy(0,offset);
    }

    public scrollTo(position: number) {
        scrollTo(0,position);
    }
}

export default new ViewPort();