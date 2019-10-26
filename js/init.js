require('./utils');
const documents = require('./documents');

const { BrowserWindow, dialog } = require('electron').remote;

const draggable = require('./draggable');
const episodes = require('./episodes');
const theme = require('./theme');
const { openInCodeEditor } = require('@cawita/data-validation-utils/src/back-end-utils');
const path = require('path');
const fs = require('fs');

const { isset, C } = require('@cawita/data-validation-utils/src');

try {
    window.addEventListener('DOMContentLoaded', () => {

        // TITLE APP BAR
        $('#title-bar-min').click(() => BrowserWindow.getFocusedWindow().minimize());
        $('#title-bar-full').click(() => BrowserWindow.getFocusedWindow().setFullScreen(!BrowserWindow.getFocusedWindow().isFullScreen()));
        $('#title-bar-close').click(() => BrowserWindow.getFocusedWindow().close());
        $('.new-document').click(() => documents.newDocument(dialog));
        $('.open-document').click(() => documents.openDocument(dialog));
        $('.close-document').click(() => documents.closeDocument());
        $('.dropdown-toggle').click(function() {
            $(this).find('.dropdown').toggleClass('active');
        });
        $(document).click(function(event) {
            $target = $(event.target);
            if (!$target.hasClass('dropdown') && !$target.closest('.dropdown,.dropdown-toggle').length) $('.dropdown').removeClass('active');
        });

        if (Object.keys(AppConfig).length === 0 || !AppConfig.activeDocument) true;
        else documents.openDocument(dialog, AppConfig.activeDocument, true);


        //----------------------------------------
        // TOOLBAR
        //----------------------------------------
        btn('#open-db-in-vscode', () => openInCodeEditor(path.resolve(__dirname, './data.json')));
        $('#expand-all').click(() => $('.line').addClass('expanded'));
        $('#expand-none').click(() => $('.line').removeClass('expanded'));

        //----------------------------------------
        // REFRESH
        //----------------------------------------
        OnRefresh(
            // menu items
            () => $('.menu-item').off('click').click(function() {
                Config.activePanel = $(this).data('section');
                $('.panel').fadeOut(50);
                $('#' + Config.activePanel).fadeIn(50);
                Refresh();
            }),
            // textarea auto resize
            () => $('textarea').each(function() {
                this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
            }).off('input').on('input', function() {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
            }),
            // draggables
            () => draggable.init(),
            // COMMENTS
            () => {
                $('.new-comment > .input').keyup(e => {
                    if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
                        const target = $(e.target);
                        const content = target.html().replace(/<div><br><\/div>/g, '');
                        if (content) {
                            target.closest('.comments').find('.comments-inner').append(episodes.commentTemplate({ user: '^-^', content }));
                        }
                        target.html('');
                    }
                });
            },
            // EXPAND / COMPACT BEHAVIOR
            () => $('.expand').click(function() { $(this).closest('.line').addClass('expanded'); }),
            () => $('.compact').click(function() { $(this).closest('.line').removeClass('expanded'); }),
            // DELETE PARENT
            () => btn('.delete-parent', item => confirm('Are you sure that you want to delete this item ?') && item.parent().remove())

        );

        //----------------------------------------
        // CONTEXT MENU
        //----------------------------------------
        $('#context-menu').click(function() {
            $('#context-menu').fadeOut(50);
            $('.context-selected').removeClass('context-selected');
            activeElement = null;
        });
        $('body').contextmenu(function(e) {
            $('#context-menu').hide(0);
            const context = $(e.target).closest('[data-context]').data('context');
            if (isset(context) && typeof context === 'number') {
                activeElement = $(e.target);
                activeElement.closest('.context-select').addClass('context-selected');
                $('.right-clic-menu').hide(0);
                $('#right-clic-menu-' + context).show(0);
                $('#context-dropdown').css({ top: e.pageY, left: e.pageX, });
                $('#context-menu').fadeIn(50);
            }
            return false;
        });

        //----------------------------------------
        // STYLES
        //----------------------------------------
        const files = [
            '../css/theme.scss',
            '../css/main.scss',
        ];
        for (const file of files) {
            const content = fs.readFileSync(path.resolve(__dirname, file), 'utf-8');
            $('head').append($(`<style>${content.replace(/\$([A-Za-z0-9_]+)/g, (m,$1) => isset(theme[$1]) ?theme[$1] : C.warning(`${$1} not set in theme`) )}</style>`));
        }

        episodes.onAppLoad();

        Refresh();

        setTimeout(() => $('#preloader').fadeOut(300), 300);
    });
} catch (err) {
    DISABLEAUTOSAVE = true;
    C.error(err);
}
