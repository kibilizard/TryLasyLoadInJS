/**
 * класс Preloader добавляет к документу элемент прелоадера и отвечает за его показ/скрытие
 * 
 * on - показать прелоадер
 * off - скрыть прелоадер
 */
class Preloader {
    private block: HTMLElement;

    constructor(){
        this.block = document.createElement('div');
        document.body.appendChild(this.block);
        this.block.className = 'preloader';
        this.off();
    }

    public on(){
        this.block.style.display = 'block';
    }

    public off(){
        this.block.style.display = 'none';
    }
}

export default new Preloader();