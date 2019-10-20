global.activeElement;
global.DB;
global.ActiveEpisode;
global.ActivePanel = 'resume';
global.Config;
global.btn = btn;
global.rightClicMenu = rightClicMenu;
global.DBSAVE = () => true;
global.OnSave = OnSave;
global.SAVE = SAVE;
global.OnRefresh = OnRefresh;
global.Refresh = Refresh;
global.ItemInsertManager = ItemInsertManager;

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

function rightClicMenu(itemMenuClass, closestParentSelector, callback) {
    $(itemMenuClass).off('click').click(() => {
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
function ItemInsertManager(context, closestParentSelector, template) {
    if (ActivePanel === context) {
        rightClicMenu('.add-line-before', closestParentSelector, item => {
            item.before(template);
            Refresh();
        });
        rightClicMenu('.add-line-after', closestParentSelector, item => {
            item.after(template);
            Refresh();
        });

        rightClicMenu('.delete-line', closestParentSelector, item => {
            if (confirm('Are you sure you want to delete this item ?')) item.remove();
        });
    }
}

//----------------------------------------
// SAVE
//----------------------------------------
const saveFunctions = [];

function OnSave(...fns) {
    saveFunctions.push(...fns);
}

function SAVE() {
    for (const fn of saveFunctions) fn();
    DBSAVE();
}

setInterval(SAVE, 1000);

//----------------------------------------
// REFRESH
//----------------------------------------
const refreshFunctions = [];

function OnRefresh(...fns) {
    refreshFunctions.push(...fns);
}

function Refresh() {
    for (const fn of refreshFunctions) fn();
}
