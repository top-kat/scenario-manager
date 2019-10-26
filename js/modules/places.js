const sectionTemplate = (title = 'title', description = 'description') => `
<div class='place-section'>
    <h3 class='place-section-title' contenteditable="true">${title}</h3>
    <div class='place-section-description' contenteditable="true">${description}</div>
</div>`;

module.exports = {
    name: 'places',
    displayName: 'Places',
    order: 4,
    contextMenuIndex: 3,
    onAppLoad() {
        rightClicMenu(this.contextMenuIndex, '.add-section', '.line', item => {
            item.find('.place-sections').append(sectionTemplate());
            Refresh();
        });
    },
    onDocumentLoad() {},
    defaultItemInDb() {
        return {
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
            <div class='place'>
                <h2 class="place-name" contenteditable="true">${place.name}</h2>
                <div class="place-generalDescription" contenteditable="true">${place.generalDescription}</div>
                <div class="place-sections">${place.sections.map(({title,description}) => sectionTemplate(title, description)).join('')}
                </div>
            </div>`;
    },
    OnRefresh() {},
    onSave() {},
    onSaveLine($item, line) {
        line.sections = [];
        line.name = $item.find('.place-name').first().html();
        line.generalDescription = $item.find('.place-generalDescription').first().html();
        $item.find('.place-section').each(function() {
            const title = $(this).find('.place-section-title').first().html();
            const description = $(this).find('.place-section-description').first().html();
            line.sections.push({ title, description });
        });
        return line;

    }
};
