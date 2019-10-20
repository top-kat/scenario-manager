const fs = require('fs');
const db = require('./data');
const path = require('path');

let lengthBefore = JSON.stringify(db, null, 2).length;
let disableSave = false;
let disableSaveTO;

// PERF TO avoid saving while editing but wait until 3sec pause
window.addEventListener('keyup', function() {
    disableSave = true;
    clearTimeout(disableSaveTO);
    disableSaveTO = setTimeout(() => disableSave = false, 3000);
});

DB = {
    ...db,
    save() {
        const dbString = JSON.stringify(DB, null, 2);
        if (!disableSave && dbString.length !== lengthBefore) {
            lengthBefore = dbString.length;
            fs.writeFileSync(path.resolve(__dirname, './data.json'), JSON.stringify(DB, null, 2));
        }
    },
};

DBSAVE = DB.save;
