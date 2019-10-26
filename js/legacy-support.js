const { generateToken, isset } = require('@cawita/data-validation-utils/src');

module.exports = function(db) {

    // 1.0.4 episodes is now object with ids
    if (Array.isArray(db.episodes)) {
        const episodeAsObjects = {};
        db.episodes.forEach(episode => episodeAsObjects[generateToken()] = episode);
        db.episodes = episodeAsObjects;
    }

    // 1.0.4 episodes as now an order field
    let i = 0;
    for (const episode in db.episodes) {
        if (!isset(db.episodes[episode].order)) db.episodes[episode].order = i++;
    }

    return db;
};
