const alternativeTemplate = (title = 'Title', content = 'Content') => `
<div class='alternative flex11'>
<i class="delete-alternative">close</i>
<i class="expand">keyboard_arrow_down</i>
<i class="compact">keyboard_arrow_up</i>
    <div class='alternative-title' contenteditable="plaintext-only">${title}</div>
    <div class='alternative-content' contenteditable="plaintext-only">${content}</div>
</div>
`;

module.exports = {
    name: 'summary',
    displayName: 'Summary',
    order: 0,
    contextMenuIndex: 1,
    onAppLoad() {
        rightClicMenu(this.contextMenuIndex, '.add-alternative', '.line', item => {
            item.find('.alternatives').append(alternativeTemplate());
            Refresh();
        });
        rightClicMenu(this.contextMenuIndex, '.expand', '.line', item => item.toggleClass('expanded'));
    },
    onDocumentLoad() {},
    defaultItemInDb() {
        return {
            comments: [],
            alternatives: [{
                title: '',
                content: ''
            }, ],
            expanded: false,
            commentExpanded: false,
        };
    },
    lineTemplate(summary = this.defaultItemInDb()) {
        return `
        <div class='alternatives flex'>
            ${summary.alternatives.map(alt => alternativeTemplate(alt.title, alt.content)).join('')}
        </div>`;
    },
    OnRefresh() {
        btn('.delete-alternative', '.alternative', (_, parent) => {
            if (confirm('Are you sure you want to delete this alternative ?')) {
                const parent2 = parent.closest('.alternatives');
                parent.remove();
                if (!parent2.find('.alternative').length) parent2.closest('.line').remove();
            }
        });
    },
    onSave() {},
    onSaveLine($item, line) {
        line.alternatives = [];
        // ALTERNATIVES
        $item.find('.alternative').each(function() {
            const $alternative = $(this);
            const title = $alternative.find('.alternative-title').first().html();
            const content = $alternative.find('.alternative-content').first().html();
            line.alternatives.push({ title, content });
        });
        return line;
    }
};
