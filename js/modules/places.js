const { generateToken } = require('@cawita/data-validation-utils/src');


const sectionTemplate = (title = 'title', description = 'description') => `
<div class='place-section'>
    <h3 class='place-section-title' contenteditable="true">${title}</h3>
    <div class='place-section-description' contenteditable="true">${description}</div>
</div>`;

module.exports = {
    active: true,
    name: 'places',
    displayName: 'Places',
    order: 4,
    contextMenuIndex: 3,
    byEpisode: false,
    onAppLoad() {
        rightClicMenu(this.contextMenuIndex, '.add-section', '.line', item => {
            item.find('.place-sections').append(sectionTemplate());
            Refresh();
        });
    },
    onDocumentLoad() {},
    defaultItemInDb() {
        return {
            id: generateToken(),
            name: '',
            generalDescription: '',
            sections: [],
            comments: [],
            expanded: true,
            commentExpanded: false,
        };
    },
    lineTemplate(place = this.defaultItemInDb()) {
        return `
            <div id='${place.id || generateToken()}' class='place'>
                <h2 class="place-name" contenteditable="plaintext-only">${place.name}</h2>
                <div class="place-generalDescription" contenteditable="plaintext-only">${place.generalDescription}</div>
                <div class="place-sections">${place.sections.map(({title,description}) => sectionTemplate(title, description)).join('')}
                </div>
            </div>`;
    },
    OnRefresh() {},
    onSave() {},
    onSaveLine($item, line) {
        line.sections = [];
        line.id = $item.attr('id') || generateToken();
        line.name = $item.find('.place-name').first().text();
        line.generalDescription = $item.find('.place-generalDescription').first().text();
        $item.find('.place-section').each(function() {
            const title = $(this).find('.place-section-title').first().text();
            const description = $(this).find('.place-section-description').first().text();
            line.sections.push({ title, description });
        });
        return line;
    }
};
