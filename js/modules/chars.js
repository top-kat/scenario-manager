const { generateToken } = require('@cawita/data-validation-utils/src');

module.exports = {
    active: true,
    name: 'chars',
    displayName: 'Characters',
    contextMenuIndex: 2,
    order: 2,
    byEpisode: false,
    onAppLoad() {},
    leftMenu(persos) {
        return persos.map(p => {
            return `<div class='menu-link' data-id="${p.id}"><a contenteditable="plaintext-only">${name}</a></div>`;
        });
    },
    onDocumentLoad() {},
    defaultItemInDb() {
        return {
            id: generateToken(),
            name: '',
            physicalDescription: '',
            character: '',
            history: '',
            comments: [],
            commentExpanded: false,
        };
    },
    lineTemplate(perso = this.defaultItemInDb()) {
        return `
            <div id='${perso.id || generateToken()}' class='char'>
                <div class="char-name"><b>Name:</b> <span contenteditable="plaintext-only">${perso.name}</span></div>
                <div class="char-physicalDescription"><b>Physical description:</b> <span contenteditable="plaintext-only">${perso.physicalDescription}</span></div>
                <div class="char-character"><b>Character:</b> <span contenteditable="plaintext-only">${perso.character}</span></div>
                <div class="char-history"><b>History:</b> <span contenteditable="plaintext-only">${perso.history}</span></div>
            </div>`;
    },
    OnRefresh() {},
    onSave() {},
    onSaveLine($item, line) {
        line.id = $item.attr('id') || generateToken();
        line.name = $item.find('.char-name > span').first().html();
        line.physicalDescription = $item.find('.char-physicalDescription > span').first().html();
        line.character = $item.find('.char-character > span').first().html();
        line.history = $item.find('.char-history > span').first().html();
        return line;

    }
};
