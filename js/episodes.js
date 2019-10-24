const summary = require('./modules/summary');
const chars = require('./modules/chars');
const places = require('./modules/places');
const chronology = require('./modules/chronology');

const { isset } = require('@cawita/data-validation-utils/src');

const episodeLinkTemplate = name => `<div class='episode-link context-select draggable'><a contenteditable="true">${name}</a></div>`;

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
    init() {

        if (this.hasBeenInitializated) return;

        this.episodeDefaults();
        $('#nav-episodes').html('');

        //if (!ActiveDocument.episodes.length) this.newEpisode();

        for (const episode of ActiveDocument.episodes) {
            $('#nav-episodes').append(episodeLinkTemplate(episode.name));
        }

        //----------------------------------------
        // buttons
        //----------------------------------------
        btn('#new-episode', () => this.newEpisode());
        btn('#episode-extend, #episode-extend2', () => {
            $('aside').toggleClass('expanded');
            Config.episodePanelExpanded = $('aside').hasClass('expanded');
        });

        if (Config.episodePanelExpanded) $('aside').addClass('expanded');

        this.changeEpisode(Config.activeEpisode, true);

        OnRefresh(() => {
            btn('.episode-link > a', item => this.changeEpisode(item.parent().index()));
        });

        OnSave(this.onSave);

        for (const modul of [summary, chars, chronology, places]) modul.init();


        rightClicMenu('.delete-line-episode', '.episode-link', item => {
            if (confirm('Are you sure you want to delete the entire episode ?')) {
                const index = item.index();
                ActiveDocument.episodes.splice(index, 1);
                item.remove();
            }
        });

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
        if (!isset(ActiveDocument.episodes[0])) ActiveDocument.episodes[0] = newEpisodeModel();
        $('.episode-link').each(function(i) {
            if (!isset(ActiveDocument.episodes[i])) ActiveDocument.episodes[i] = newEpisodeModel();
        });
    },
    changeEpisode(index = 0, doNotSave = false) {
        if (!doNotSave) SAVE();
        $('main, #main-nav-items').html('');
        console.log(`index`, index);
        console.log(`ActiveDocument.episodes`, ActiveDocument.episodes);
        Config.activeEpisode = index;
        ActiveEpisode = ActiveDocument.episodes[index].config;

        for (const modul of [summary, chars, chronology, places]) {

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

            OnSave(modul.onSave, () => {
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
            OnRefresh(modul.OnRefresh.bind(modul), () => ItemInsertManager(modul.name, '.line', genericLineTemplate(modul, modul.defaultItemInDb())));
        }

        rightClicMenu('.add-comment', '.line', item => item.toggleClass('comments-expanded'));

        Refresh();
    },
    onSave() {
        const index = Config.activeEpisode;
        ActiveDocument.episodes[index].name = $('.episode-link').eq(index).find('a').html();
    },
    newEpisode() {
        $('#nav-episodes').append(episodeLinkTemplate(''));
        this.episodeDefaults();
        Refresh();
    }
};
