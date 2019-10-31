const { generateToken } = require('@cawita/data-validation-utils/src');

module.exports = {
    active: true,
    name: 'chronology',
    displayName: 'Chronology',
    contextMenuIndex: 5,
    order: 3,
    byEpisode: false,
    onAppLoad() {},
    onDocumentLoad() {
        $('.chronology-sidebar-nav').html(ActiveDocument.chronology.map(p => {
            return `<div class='menu-link'><a href="#${p.id}">${p.date || '...'}</a></div>`;
        }).join('\n'));
    },
    defaultItemInDb() {
        return {
            id: generateToken(),
            date: '',
            description: '',
            comments: [],
            commentExpanded: false,
        };
    },
    lineTemplate(date = this.defaultItemInDb()) {
        return `
            <div id='${date.id || generateToken()}' class='date'>
                <div class="date-date"><b contenteditable="plaintext-only">${date.date}</b></div>
                <div class="date-description" contenteditable="plaintext-only">${date.description}</div>
            </div>`;
    },
    OnRefresh() {},
    onSave() {},
    onSaveLine($item, line) {
        line.id = $item.attr('id') || generateToken();
        line.date = $item.find('.date-date > b').first().text();
        line.description = $item.find('.date-description').first().text();
        return line;
    }
};
