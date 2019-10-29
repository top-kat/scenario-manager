const path = require('path');
const fs = require('fs');
const normalizedPath = path.join(__dirname, 'modules');

const registeredModules = [];
fs.readdirSync(normalizedPath).forEach(function(file) {
    registeredModules.push(require('./modules/' + file));
});
registeredModules.sort((a, b) => a.order - b.order);

const { isset, generateToken } = require('@cawita/data-validation-utils/src');

const episodeLinkTemplate = (name = '', id = generateToken()) => `<div class='episode-link context-select draggable' data-id="${id}"><a contenteditable="true">${name}</a></div>`;

const newEpisodeModel = () => ({
    name: '',
    config: {
        summary: []
    }
});

const genericLineTemplate = (modul, line, commentTemplate) => `
<div class='draggable line context-select flex column${line.expanded ? ' expanded':''}${line.commentExpanded ? ' comments-expanded':''}' data-context='${modul.contextMenuIndex}'>
    ${modul.lineTemplate(line)}
    <div class='comments'>
        <div class='comments-inner'>
            ${line.comments.length ? line.comments.map(com => commentTemplate(com) ).join('') : ''}
        </div>
        <div class='new-comment flex align-items-center'>
            <i style='margin-right:15px'>add_comment</i>
            <div class='input flex11' style='margin-right:15px' contenteditable="true"></div>
        </div>
    </div>
</div>
`;

module.exports = {
    onAppLoad() {
        //----------------------------------------
        // buttons
        //----------------------------------------
        btn('#new-episode', () => this.newEpisode());
        btn('#episode-extend, #episode-extend2', () => {
            $('aside').toggleClass('expanded');
            Config.episodePanelExpanded = $('aside').hasClass('expanded');
        });

        if (Config.episodePanelExpanded) $('aside').addClass('expanded');

        OnRefresh(() => {
            btn('.episode-link > a', item => this.changeEpisode(item.parent().data('id')));
        });

        OnSave(this.onSave.bind(this));

        for (const modul of registeredModules) modul.onAppLoad && modul.onAppLoad();

        ItemInsertManager(4, '.episode-link', episodeLinkTemplate());

    },
    onDocumentLoad() {
        this.episodeDefaults();
        for (const modul of registeredModules) modul.onDocumentLoad && modul.onDocumentLoad();

        $('#nav-episodes').html('');

        const episodes = [];
        for (const episodeId in ActiveDocument.episodes) {
            episodes[ActiveDocument.episodes[episodeId].order] = { ...ActiveDocument.episodes[episodeId], episodeId };
        }

        for (const episode of episodes) $('#nav-episodes').append(episodeLinkTemplate(episode.name, episode.episodeId));

        this.changeEpisode(Config.activeEpisode, true);
    },
    commentTemplate(comment) {
        return `
            <div class='comment'>
                <div class='comment-user'>${comment.user}</div>
                <div class='comment-content'>${comment.content}</div>
                <i class='delete-parent'>close</i>
            </div>`;
    },
    // default episodes for new ones
    episodeDefaults() {
        // default if no episode is set
        if (Object.keys(ActiveDocument.episodes).length === 0) ActiveDocument.episodes[generateToken()] = newEpisodeModel();

        // if link as been created but not episode in data
        $('.episode-link').each(function() {
            const newEpId = $(this).data('id');
            if (!isset(ActiveDocument.episodes[newEpId])) ActiveDocument.episodes[newEpId] = newEpisodeModel();
        });
    },
    changeEpisode(episodeId, doNotSave = false) {
        if (!doNotSave) SAVE();
        $('main, #main-nav-items').html('');

        episodeId = isset(episodeId, ActiveDocument.episodes[episodeId]) ? episodeId : Object.keys(ActiveDocument.episodes)[0];

        Config.activeEpisode = episodeId;
        ActiveEpisode = ActiveDocument.episodes[episodeId].config;

        for (const modul of registeredModules) {

            const name = modul.name;

            $('main').append(`<section id='${name}' class='panel' style='${Config.activePanel === name ? '' : 'display:none'}'></section>`);
            $('#main-nav-items').append(`<li id="${modul.name}-main-menu-item" class="menu-item${Config.activePanel === name ? ' active':''}" data-section="${modul.name}">${modul.displayName}</li>`);

            const $section = $(`#${name}`);
            $section.html('');
            if (!isset(ActiveEpisode[name])) ActiveEpisode[name] = [];
            if (!ActiveEpisode[name].length) ActiveEpisode[name].push(modul.defaultItemInDb());

            // feed summary lines
            for (const line of ActiveEpisode[name]) {
                $section.append(genericLineTemplate(modul, line, this.commentTemplate));
            }

            OnSave(modul.onSave.bind(modul), () => {
                const lines = [];
                $(`#${name} .line`).each(function() {
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
                ActiveEpisode[name] = lines;
            });
            OnRefresh(modul.OnRefresh.bind(modul), () => ItemInsertManager(modul.contextMenuIndex, '.line', genericLineTemplate(modul, modul.defaultItemInDb())));
        }

        rightClicMenu(-1, '.add-comment', '.line', item => item.toggleClass('comments-expanded'));
        rightClicMenu(-1, '.expand-ctx', '.line', item => item.toggleClass('expanded'));

        Refresh();
    },
    onSave() {
        this.episodeDefaults();
        $('.episode-link').each(function(order) {
            const episodeId = $(this).data('id');
            const OrderBefore = ActiveDocument.episodes[episodeId].order;
            ActiveDocument.episodes[episodeId].order = parseInt(order);
            console.log(`ORDER`, OrderBefore, ActiveDocument.episodes[episodeId].order);
            ActiveDocument.episodes[episodeId].name = $(this).find('a').html();
        });
    },
    newEpisode() {
        $('#nav-episodes').append(episodeLinkTemplate());
        this.episodeDefaults();
        Refresh();
    }
};
