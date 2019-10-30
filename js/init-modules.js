const { isset } = require('@cawita/data-validation-utils/src');
const panels = require('./panels');

const genericLineTemplate = (modul, line, commentTemplate) => `
<div class='draggable line context-select flex column${line.expanded ? ' expanded':''}${line.commentExpanded ? ' comments-expanded':''}' data-context='${modul.contextMenuIndex}'>
    ${modul.lineTemplate(line)}
    <div class='comments'>
        <div class='comments-inner'>
            ${line.comments.length ? line.comments.map(com => commentTemplate(com) ).join('') : ''}
        </div>
        <div class='new-comment flex align-items-center'>
            <i style='margin-right:15px'>add_comment</i>
            <div class='input flex11' style='margin-right:15px' contenteditable="plaintext-only"></div>
        </div>
    </div>
</div>
`;


module.exports = {
    commentTemplate(comment) {
        return `
            <div class='comment'>
                <div class='comment-user'>${comment.user}</div>
                <div class='comment-content'>${comment.content}</div>
                <i class='delete-parent'>close</i>
            </div>`;
    },
    appLoad() {

        $('main, #main-nav-items').html('');

        const activePanel = MODULES[0].name;

        for (const modul of MODULES) {

            // add module section
            $('main').append(`<section id='${modul.name}' class='panel' style='${activePanel === modul.name ? '' : 'display:none'}'></section>`);
            // add item in main menu
            $('#main-nav-items').append(`<li id="${modul.name}-main-menu-item" class="menu-item${activePanel === modul.name ? ' active':''}" data-section="${modul.name}">${modul.displayName}</li>`);
            // add module sidebar
            if (modul.sidebar) $('aside').append(modul.sidebar());
            else $('aside').append(`
            <div class="sidebar ${modul.name}-sidebar">
                <b>${modul.displayName}</b>
                <div class="sidebar-nav-toolbar">
                    <i id='sidebar-extend'>keyboard_arrow_right</i>
                    <i id='sidebar-extend2'>keyboard_arrow_left</i>
                </div>
                <nav class="sidebar-nav ${modul.name}-sidebar-nav"></nav>
            </div>`);

            OnSave(modul.onSave.bind(modul), () => {
                const lines = [];
                $(`#${modul.name} .line`).each(function() {
                    const line = modul.defaultItemInDb();
                    line.expanded = $(this).hasClass('expanded');
                    line.commentExpanded = $(this).hasClass('comments-expanded');
                    modul.onSaveLine.bind(modul)($(this), line);
                    // COMMENTS
                    $(this).find('.comment').each(function() {
                        const $comment = $(this);
                        const user = $comment.find('.comment-user').first().html();
                        const content = $comment.find('.comment-content').first().html();
                        line.comments.push({ user, content });
                    });
                    lines.push(line);
                });
                const db = modul.byEpisode ? ActiveEpisode : ActiveDocument;
                db[modul.name] = lines;
            });
            OnRefresh(modul.OnRefresh.bind(modul), () => ItemInsertManager(modul.contextMenuIndex, '.line', genericLineTemplate(modul, modul.defaultItemInDb(), this.commentTemplate)));

            modul.onAppLoad && modul.onAppLoad();
        }
    },
    documentLoad(episodeChange = false) {
        for (const modul of MODULES) {
            const db = modul.byEpisode ? ActiveEpisode : ActiveDocument;

            if (Config.activePanel === modul.name) panels.set(modul.name);

            const $section = $(`#${modul.name}`);
            $section.html('');
            if (!isset(db[modul.name])) db[modul.name] = [];

            if (!db[modul.name].length) db[modul.name].push(modul.defaultItemInDb());

            // feed section lines
            for (const line of db[modul.name]) {
                if (modul.name === 'chars') {
                    console.log(`line.name`, line.name);
                    console.log(`genericLineTemplate(modul, line, this.commentTemplate)`, genericLineTemplate(modul, line, this.commentTemplate));
                }
                $section.append(genericLineTemplate(modul, line, this.commentTemplate));
            }
            console.log(`$section.html()`, $section, $section.html());
            if (!episodeChange) modul.onDocumentLoad && modul.onDocumentLoad();
        }
    },
    // alias
    episodeChange() {
        return this.documentLoad(true);
    }
};
