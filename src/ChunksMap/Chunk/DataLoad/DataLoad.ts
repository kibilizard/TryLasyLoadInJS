/**
 * getData - функция для загрузки массива строк для чанка по id с удаленного сервера
 * @param idx - индекс чанка
 * 
 * doc_list_chunk_${idx}.pdx - созданы заранее
 * расширение .pdx приходится использовать из-за особенностей хостинга на котором файлы лежат
 */
export const getData = (idx: number) => new Promise((resolve, reject)=>{
    let url = `http://kibilizard.org/shared/doc_list_chunk_${idx}.pdx`;

    let req = new XMLHttpRequest();

    req.open('GET',url, true);
    req.overrideMimeType('text/plain; charset=windows-1251'); //подмена кодировки для ie
    req.onload = function() {
        if (this.status === 200) {
            let rowsSplit = this.response.split(/\r?\n+/);
            let rows = [], row="";
            for (let i=0; i<rowsSplit.length; i++){
                let current = rowsSplit[i];
                if (current === ""){
                    row !== "" && rows.push(row);
                    row = "";
                } else {
                    if (row !== "") row += '\n';
                    row += current;
                }
            }
            resolve(rows);
        }
    }
    req.onerror = function() {
        console.error(new Date(),this);
        reject();
    }
    req.send();
})