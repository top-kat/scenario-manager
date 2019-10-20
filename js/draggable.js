module.exports = {
    init() {
        $('.drag-handler').remove();
        $('.draggable').append(`<div class='drag-handler' draggable="true"><i>more_vert</i></div>`);
        $('[draggable]').get().forEach(e => addDnDHandlers(e));

        var dragSrcEl = null;

        function handleDragStart(e) {
            // Target (this) element is the source node.

            const $parent = $(this).closest('.draggable');
            dragSrcEl = $parent;

            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', $parent[0].outerHTML);

            $parent.addClass('dragElem');
        }

        function handleDragOver(e) {
            if (e.preventDefault) e.preventDefault();

            const $parent = $(this).closest('.draggable');

            $parent.addClass('over');

            e.dataTransfer.dropEffect = 'move'; // See the section on the DataTransfer object.

            return false;
        }

        function handleDragEnter() {
            // this / e.target is the current hover target.
        }

        function handleDragLeave() {
            const $parent = $(this).closest('.draggable');
            $parent.removeClass('over'); // this / e.target is previous target element.
        }

        function handleDrop(e) {
            // this/e.target is current target element.

            if (e.stopPropagation) e.stopPropagation(); // Stops some browsers from redirecting.
            const $targetParent = $(this).closest('.draggable');

            // Don't do anything if dropping the same column we're dragging.
            if (dragSrcEl[0] != $targetParent[0]) {
                const container = dragSrcEl.parent().get(0);
                // Set the source column's HTML to the HTML of the column we dropped on.
                //alert(this.outerHTML);
                //dragSrcEl.innerHTML = this.innerHTML;
                //this.innerHTML = e.dataTransfer.getData('text/html');
                container.removeChild(dragSrcEl.get(0));
                var dropHTML = e.dataTransfer.getData('text/html');
                $targetParent.before(dropHTML);

                //this.insertAdjacentHTML('beforebegin', dropHTML);
                var dropElem = $targetParent.get(0).previousSibling;
                addDnDHandlers(dropElem);

                $('.over').removeClass('over');
            }
            return false;
        }

        function handleDragEnd() {
            // this/e.target is the source node.
            const $parent = $(this).closest('.draggable');
            $parent.removeClass('over');

        }

        function addDnDHandlers(elem) {
            elem.addEventListener('dragstart', handleDragStart, false);
            elem.addEventListener('dragenter', handleDragEnter, false);
            elem.addEventListener('dragover', handleDragOver, false);
            elem.addEventListener('dragleave', handleDragLeave, false);
            elem.addEventListener('drop', handleDrop, false);
            elem.addEventListener('dragend', handleDragEnd, false);

        }
    }
};
