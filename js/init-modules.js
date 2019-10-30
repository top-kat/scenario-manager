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
    appLoad() {

        $('main, #main-nav-items').html('');

        episodes.onAppLoad();
        for (const modul of MODULES) {

            $('main').append(`<section id='${modul.name}' class='panel' style='${Config.activePanel === modul.name ? '' : 'display:none'}'></section>`);
            // add item in main menu
            $('#main-nav-items').append(`<li id="${modul.name}-main-menu-item" class="menu-item${Config.activePanel === modul.name ? ' active':''}" data-section="${modul.name}">${modul.displayName}</li>`);

            modul.onAppLoad && modul.onAppLoad();
        }
    },
    documentLoad(episodeChange = false) {
        for (const modul of MODULES) {

            const db = modul.byEpisode ? ActiveEpisode : ActiveDocument;

            const $section = $(`#${modul.name}`);
            $section.html('');
            if (!isset(db[modul.name])) db[modul.name] = [];
            if (!db[modul.name].length) db[modul.name].push(db[modul.name].defaultItemInDb());

            // feed section lines
            for (const line of db[modul.name]) {
                $section.append(genericLineTemplate(db[modul.name], line, this.commentTemplate));
            }

            OnSave(db[modul.name].onSave.bind(db[modul.name]), () => {
                const lines = [];
                $(`#${moduleName} .line`).each(function() {
                    const line = db[modul.name].defaultItemInDb();
                    line.expanded = $(this).hasClass('expanded');
                    line.commentExpanded = $(this).hasClass('comments-expanded');
                    db[modul.name].onSaveLine.bind(db[modul.name])($(this), line);
                    // COMMENTS
                    $(this).find('.comment').each(function() {
                        const $comment = $(this);
                        const user = $comment.find('.comment-user').first().html();
                        const content = $comment.find('.comment-content').first().html();
                        line.comments.push({ user, content });
                    });
                    lines.push(line);
                });
                db[modul.name] = lines;
            });
            OnRefresh(db[modul.name].OnRefresh.bind(db[modul.name]), () => ItemInsertManager(db[modul.name].contextMenuIndex, '.line', genericLineTemplate(db[modul.name], db[modul.name].defaultItemInDb())));

            if (!episodeChange) modul.onDocumentLoad && modul.onDocumentLoad();
        }
    },
    // alias
    episodeChange() {
        return this.documentLoad(true);
    }
};
