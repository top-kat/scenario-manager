global.activeElement = null; // for right click
global.AppConfig; // stored in program files at app level
global.Config = null; // config from user document
global.ActiveDocument = null; // The user document full, modifiable, to be saved
global.ActiveEpisode = null; // Episode object with all datas
global.MODULES = []; // modules in the module folder
global.OnSave = OnSave;
global.SAVE = SAVE;
global.OnRefresh = OnRefresh;
global.Refresh = Refresh;
global.ItemInsertManager = ItemInsertManager;
global.rightClicMenu = rightClicMenu;
global.btn = btn;
global.DISABLEAUTOSAVE = false; // on error
global.SAVEALL = () => true;
global.RESCUESAVE = () => true;
global.ERROR = errMsg => alert(`${errMsg}

If you think this is an issue, please contact webmaster@nicewebagence.com

For debugging informations, type ctrl+maj+i to see logs and send a screenshot

Be safe, your data has been double saved
`);


//----------------------------------------
// BTNS
//----------------------------------------
function btn(btnClass, parentSelectorOrCallback, callback) {
    $(btnClass).off('click').click(function() {
        if (typeof parentSelectorOrCallback === 'function') parentSelectorOrCallback($(this));
        else {
            const parent = $(this).closest(parentSelectorOrCallback);
            callback($(this), parent);
        }
    });
}

function rightClicMenu(rightClicMenuIndex, itemMenuSelector, closestParentSelector, callback) {
    let idSelector = '';
    if (rightClicMenuIndex !== -1) idSelector = '#right-clic-menu-' + rightClicMenuIndex + ' ';
    $(idSelector + itemMenuSelector).off('click').click(() => {
        if (activeElement) {
            let item;
            if (activeElement.is(closestParentSelector)) item = activeElement;
            else item = activeElement.closest(closestParentSelector);
            callback(item);
        }
    });
}

//----------------------------------------
// ITEM INSERT
//----------------------------------------
function ItemInsertManager(rightClicMenuIndex, closestParentSelector, template) {
    //if (Config.activePanel === context) {
    rightClicMenu(rightClicMenuIndex, '.add-line-before', closestParentSelector, item => {
        item.before(template);
        Refresh();
    });
    rightClicMenu(rightClicMenuIndex, '.add-line-after', closestParentSelector, item => {
        item.after(template);
        Refresh();
    });

    rightClicMenu(rightClicMenuIndex, '.delete-line', closestParentSelector, item => {
        if (confirm('Are you sure you want to delete this item ?')) item.remove();
        Refresh();
    });
    //}
}

//----------------------------------------
// SAVE
//----------------------------------------
const saveFunctions = [];

function OnSave(...fns) {
    saveFunctions.push(...fns);
}

function SAVE(force) {
    if (!ActiveDocument || DISABLEAUTOSAVE) return;
    for (const fn of saveFunctions) fn();
    SAVEALL(force);
}

setInterval(SAVE, 1000);


setInterval(() => DISABLEAUTOSAVE ? null : RESCUESAVE(), 1000 * 60 * 5);

//----------------------------------------
// REFRESH
//----------------------------------------
const refreshFunctions = [];

function OnRefresh(...fns) {
    refreshFunctions.push(...fns);
}

function Refresh() {
    for (const fn of refreshFunctions) fn();
    SAVE(true);
}
