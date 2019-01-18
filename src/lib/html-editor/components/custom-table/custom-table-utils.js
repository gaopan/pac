export default {

    getTableActionDetails() {
        
        var actionBarConfig = [
            { action: 'addRight', icon: 'icon-add_column_right', title: '向右插入列' },
            { action: 'addLeft', icon: 'icon-add_column_left', title: '向左插入列' },
            { action: 'removeCol', icon: 'icon-delete_column', title: '删除列' },
            { action: 'addTop', icon: 'icon-add_row_above', title: '向下插入行' },
            { action: 'addBottom', icon: 'icon-add_row_below', title: '向上插入行' },
            { action: 'removeRow', icon: 'icon-delete_row', title: '删除行' },
            { action: 'removeTable', icon: 'icon-delete_table', title: '删除表格' },
        ]

        return actionBarConfig;
        
    },
    setCaretAtFirstCell(elem, atStart) {

        //focus on the first column at first row (caret position)
        //https://stackoverflow.com/questions/4233265/contenteditable-set-caret-at-the-end-of-the-text-cross-browser    
        elem.focus();

        let range = document.createRange();

        range.selectNodeContents(elem);
        range.collapse(atStart); //atStart === true : set at the beginning

        let sel = document.getSelection();

        sel.removeAllRanges();
        sel.addRange(range);

    }
    
}