module.exports = {
    set(moduleName = 'summary') {
        $('.panel, .menu-item, .sidebar').removeClass('active');
        $(`#${moduleName}, #${moduleName}-main-menu-item, .${moduleName}-sidebar`).addClass('active');
        Config.activePanel = moduleName;
    }
};
