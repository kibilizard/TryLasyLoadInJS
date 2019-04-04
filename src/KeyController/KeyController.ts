/**
 * класс KeyController отвечает за выполнение обработчиков на нажатие клавиш которые должны 
 * подразумевать особое действие: 'ArrowUp','ArrowDown','PageUp','PageDown','Home','End'
 * 
 * колбеки устанавливаются в главном скрипте, связываются с функционалом ChunksMap
 */
import { AFFECT_KEYS } from "../constants";

class KeyController {

    public keyMap: Map<string,()=>void> = new Map();

    constructor () {
            
        document.body.onkeydown = (e)=>{
            if (AFFECT_KEYS.indexOf(e.key) > -1) {
                e.preventDefault();
                this.keyMap.get(e.key)();
            }
        }
    }
}

export default new KeyController();