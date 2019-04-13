export const CHUNKS_COUNT = 999;

let esHeight = 4500; // максимальная высота в IE/Edge - 5000037px с такими emptySpace укладываемся
let ua = navigator.userAgent;

let low = [/Trident/,/MSIE/,/Edge/];
let mid = [/Firefox/];
let hight = [/OPR/,/Opera/,/Chrome/];
if (!low.filter((reg)=>reg.test(ua)).length) {
    if (mid.filter((reg)=>reg.test(ua)).length){
        esHeight = 15000;// максимальная высота в Firefox - 17660130px  с такими emptySpace укладываемся
    } 
    else if (hight.filter((reg)=>reg.test(ua)).length) {
        esHeight = 22000;// максимальная высота в Chrome/Opera - 33554400px, но больше 22к на emptySpace не нужно
    }
}
export const EMPTY_SPACE_HEIGHT = esHeight;

export const AFFECT_KEYS = [
    'ArrowUp',
    'Up', // в IE
    'ArrowDown',
    'Down', // в IE
    'PageUp',
    'PageDown',
    'Home',
    'End'
]