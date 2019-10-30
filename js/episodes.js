const initModules = require('./init-modules');

const { isset, generateToken } = require('@cawita/data-validation-utils/src');

const episodeLinkTemplate = (name = '', id = generateToken()) => `<div class='episode-link context-select draggable' data-id="${id}"><a contenteditable="plaintext-only">${name}</a></div>`;

const newEpisodeModel = () => ({
    name: '',
    config: {
        summary: []
    }
});


module.exports = {
    onAppLoad() {
        //----------------------------------------
        // buttons
        //----------------------------------------
        btn('#new-episode', () => this.newEpisode());
        btn('#sidebar-extend, #sidebar-extend2', () => {
            $('aside').toggleClass('expanded');
            Config.episodePanelExpanded = $('aside').hasClass('expanded');
        });

        OnRefresh(() => {
            btn('.episode-link > a', item => this.changeEpisode(item.parent().data('id')));
        });

        OnSave(this.onSave.bind(this));

        ItemInsertManager(4, '.episode-link', episodeLinkTemplate());

    },
    onDocumentLoad() {
        this.episodeDefaults();

        if (Config.episodePanelExpanded) $('aside').addClass('expanded');

        $('.episode-sidebar-nav').html('');

        const episodes = [];
        for (const episodeId in ActiveDocument.episodes) {
            episodes[ActiveDocument.episodes[episodeId].order] = { ...ActiveDocument.episodes[episodeId], episodeId };
        }

        for (const episode of episodes) $('.episode-sidebar-nav').append(episodeLinkTemplate(episode.name, episode.episodeId));

        ActiveEpisode = ActiveDocument.episodes[Config.activeEpisode].config;
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
    changeEpisode(episodeId) {
        SAVE();

        episodeId = isset(episodeId, ActiveDocument.episodes[episodeId]) ? episodeId : Object.keys(ActiveDocument.episodes)[0];

        Config.activeEpisode = episodeId;
        ActiveEpisode = ActiveDocument.episodes[episodeId].config;
        console.log(`ActiveEpisode.name`, ActiveDocument.episodes[episodeId].name);
        initModules.episodeChange();

        Refresh();
    },
    onSave() {
        this.episodeDefaults();
        $('.episode-link').each(function(order) {
            const episodeId = $(this).data('id');
            ActiveDocument.episodes[episodeId].order = parseInt(order);
            ActiveDocument.episodes[episodeId].name = $(this).find('a').text();
        });
    },
    newEpisode() {
        $('.episode-sidebar-nav').append(episodeLinkTemplate());
        this.episodeDefaults();
        Refresh();
    }
};
