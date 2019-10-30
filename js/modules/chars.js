const { generateToken } = require('@cawita/data-validation-utils/src');

module.exports = {
    active: true,
    name: 'chars',
    displayName: 'Characters',
    contextMenuIndex: 2,
    order: 2,
    byEpisode: false,
    onAppLoad() {},
    // sideBar() {}, this will use default sidebar
    onDocumentLoad() {
        $('.chars-sidebar-nav').html(ActiveDocument.chars.map(p => {
            return `<div class='menu-link'><a href="#${p.id}">${name}</a></div>`;
        }).join('\n'));
    },
    defaultItemInDb() {
        return {
            id: generateToken(),
            name: '',
            physicalDescription: '',
            character: '',
            age: '',
            history: '',
            comments: [],
            commentExpanded: false,
        };
    },
    lineTemplate(perso = this.defaultItemInDb()) {
        return `
            <div id='${perso.id || generateToken()}' class='char'>
                <div class="char-name"><b>Name:</b> <span contenteditable="plaintext-only">${perso.name}</span></div>
                <div class="char-age"><b>Age:</b> <span contenteditable="plaintext-only">${perso.age}</span></div>
                <div class="char-physicalDescription"><b>Physical description:</b> <span contenteditable="plaintext-only">${perso.physicalDescription}</span></div>
                <div class="char-character"><b>Character:</b> <span contenteditable="plaintext-only">${perso.character}</span></div>
                <div class="char-history"><b>History:</b> <span contenteditable="plaintext-only">${perso.history}</span></div>
            </div>`;
    },
    OnRefresh() {},
    onSave() {},
    onSaveLine($item, line) {
        line.id = $item.attr('id') || generateToken();
        line.name = $item.find('.char-name > span').first().text();
        line.physicalDescription = $item.find('.char-physicalDescription > span').first().text();
        line.character = $item.find('.char-character > span').first().text();
        line.history = $item.find('.char-history > span').first().text();
        return line;

    }
};
