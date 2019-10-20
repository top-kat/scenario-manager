module.exports = {
    name: 'chronology',
    displayName: 'Chronology',
    contextMenuIndex: 2,
    init() {},
    defaultItemInDb() {
        return {
            date: '',
            description: '',
            comments: [],
            commentExpanded: false,
        };
    },
    lineTemplate(date = this.defaultItemInDb()) {
        return `
            <div class='date'>
                <div class="date-date"><b contenteditable="true">${date.date}</b></div>
                <div class="date-description" contenteditable="true">${date.description}</div>
            </div>`;
    },
    OnRefresh() {},
    onSave() {},
    onSaveLine($item, line) {
        line.date = $item.find('.date-date > b').first().html();
        line.description = $item.find('.date-description').first().html();
        return line;
    }
};
