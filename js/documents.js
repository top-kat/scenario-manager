const fs = require('fs');
const path = require('path');
const episodes = require('./episodes');
const legacySupport = require('./legacy-support');
const { isset, C } = require('@cawita/data-validation-utils/src');

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
        if (!fileName)[fileName] = dialog.showOpenDialogSync({
            title: 'Open scenario',
            buttonLabel: 'Open',
        });
        try {
            var content = JSON.parse(fs.readFileSync(fileName, 'utf-8'));
            content = legacySupport(content);
        } catch (err) {
            C.error(err);
            if (!noErr) ERROR('Wrong format for file!');
            else return false;
        }
        this.rescueSave(content);
        this.setActive(content, fileName);
    },
    closeDocument() {
        $('#no-document-overlay').show(0);
        ActiveDocument = undefined;
    },
    setActive(content, fileName) {
        if (!content || typeof content !== 'object') return ERROR('Save file may have been corrupted');
        this.save();
        ActiveDocument = content;
        AppConfig.activeDocument = fileName;
        Config = ActiveDocument.config;
        if (!Config.activePanel) Config.activePanel = 'summary';
        lengthBefore = JSON.stringify(ActiveDocument, null, 2);
        episodes.onDocumentLoad();
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
    rescueSave(content) {
        if (!isset(ActiveDocument) || !ActiveDocument) return;
        const fileName = AppConfig.activeDocument + '.autosave';
        const docString = content || JSON.stringify(ActiveDocument, null, 2);
        if (!disableSave && docString.length !== lengthBefore) {
            lengthBefore = docString.length;
            fs.writeFileSync(fileName, docString);
        }
    },
};

SAVEALL = documents.save;
RESCUESAVE = documents.rescueSave;
module.exports = documents;
