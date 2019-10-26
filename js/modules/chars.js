module.exports = {
    name: 'chars',
    displayName: 'Characters',
    contextMenuIndex: 2,
    order: 2,
    onAppLoad() {},
    onDocumentLoad() {},
    defaultItemInDb() {
        return {
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
            <div class='char'>
                <div class="char-name"><b>Name:</b> <span contenteditable="true">${perso.name}</span></div>
                <div class="char-physicalDescription"><b>Physical description:</b> <span contenteditable="true">${perso.physicalDescription}</span></div>
                <div class="char-character"><b>Character:</b> <span contenteditable="true">${perso.character}</span></div>
                <div class="char-history"><b>History:</b> <span contenteditable="true">${perso.history}</span></div>
            </div>`;
    },
    OnRefresh() {},
    onSave() {},
    onSaveLine($item, line) {
        line.name = $item.find('.char-name > span').first().html();
        line.physicalDescription = $item.find('.char-physicalDescription > span').first().html();
        line.character = $item.find('.char-character > span').first().html();
        line.history = $item.find('.char-history > span').first().html();
        return line;

    }
};
