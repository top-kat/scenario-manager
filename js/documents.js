const fs = require('fs');
const path = require('path');
const episodes = require('./episodes');
const { isset } = require('@cawita/data-validation-utils/src');

try {
    AppConfig = require('../data');
} catch (e) {
    fs.writeFileSync(path.resolve(__dirname, '../data.json'), JSON.stringify({}, null, 2));
}

let lengthBefore = 0;
let disableSave = false;
let disableSaveTO;

// PERF TO avoid saving while editing but wait until 3sec pause
window.addEventListener('keyup', function() {
    disableSave = true;
    clearTimeout(disableSaveTO);
    disableSaveTO = setTimeout(() => disableSave = false, 3000);
});

const defaults = () => ({
    config: {},
    episodes: []
});

const documents = {
    newDocument(dialog) {
        const content = defaults();
        let fileName = dialog.showSaveDialogSync({
            title: 'Where to store the new scenario ?',
            properties: ['openDirectory', 'createDirectory'],
            buttonLabel: 'Select'
        });
        if (!fileName.endsWith('scenario')) fileName += '.scenario';
        fs.writeFileSync(fileName, JSON.stringify(content, null, 2));
        lengthBefore = JSON.stringify(content, null, 2);
        this.setActive(content, fileName);
    },
    openDocument(dialog, fileName = '', noErr = false) {
        if (!fileName) fileName = dialog.showOpenDialogSync({
            title: 'Open scenario',
            buttonLabel: 'Open',
        });
        try {
            var content = JSON.parse(fs.readFileSync(fileName, 'utf-8'));
        } catch (err) {
            if (!noErr) alert('wrong format for file');
            else return false;
        }
        this.setActive(content, fileName);
    },
    setActive(content, fileName) {
        this.save();
        ActiveDocument = content;
        AppConfig.activeDocument = fileName;
        Config = ActiveDocument.config;
        if (!Config.activePanel) Config.activePanel = 'resume';
        // if (!Config.activeEpisode) Config.activeEpisode = 0;
        lengthBefore = JSON.stringify(ActiveDocument, null, 2);
        episodes.init();
        $('#no-document-overlay').hide(0);
    },
    save() {
        if (!isset(ActiveDocument) || !ActiveDocument) return;
        const fileName = AppConfig.activeDocument;
        const docString = JSON.stringify(ActiveDocument, null, 2);
        if (!disableSave && docString.length !== lengthBefore) {
            lengthBefore = docString.length;
            fs.writeFileSync(fileName, docString);
            // SAVE APPCONFIG
            fs.writeFileSync(path.resolve(__dirname, '../data.json'), JSON.stringify(AppConfig, null, 2));
        }
    },
};

SAVEALL = documents.save;
module.exports = documents;
