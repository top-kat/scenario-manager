const { generateToken, isset } = require('@cawita/data-validation-utils/src');

module.exports = function(db) {

    // 1.0.4 episodes is now object with ids
    if (Array.isArray(db.episodes)) {
        const episodeAsObjects = {};
        db.episodes.forEach(episode => episodeAsObjects[generateToken()] = episode);
        db.episodes = episodeAsObjects;
    }

    // 1.0.4 episodes has now an order field
    let i = 0;
    for (const episode in db.episodes) {
        if (!isset(db.episodes[episode].order)) db.episodes[episode].order = i++;
    }

    // 1.0.6 modules byEpisodes or general
    for (const modul of MODULES) {
        if (modul.byEpisode && isset(db[modul.name])) {
            // merge general datas into first episode
            let isFirstEpisode = true;
            for (const episodeId in db.episodes) {
                if (!isset(db.episodes[episodeId].config[modul.name])) db.episodes[episodeId].config[modul.name] = [];
                if (isFirstEpisode) {
                    db.episodes[episodeId].config[modul.name] = [...db.episodes[episodeId].config[modul.name], ...db[modul.name]];
                    isFirstEpisode = false;
                }
            }
            delete db[modul.name];
        } else if (!isset(db[modul.name]) && !modul.byEpisode) {
            // we take all episode datas to merge into general
            const episodeIds = [];
            db[modul.name] = [];
            for (const episodeId in db.episodes) {
                if (isset(db.episodes[episodeId].config[modul.name])) {
                    db[modul.name] = [...db[modul.name], ...db.episodes[episodeId].config[modul.name]];
                }
                episodeIds.push(episodeId);
            }
            episodeIds.forEach(epId => delete db.episodes[epId].config[modul.name]);
        }
    }

    return db;
};
