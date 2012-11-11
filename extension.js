
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Workspace = imports.ui.workspace;
const Lang = imports.lang;
const St = imports.gi.St;


let _function = null;

function init() {

}

function disable() {
    Workspace.WindowOverlay.prototype._init = _function;
}

function enable() {
    _function = Workspace.WindowOverlay.prototype._init;
    Workspace.WindowOverlay.prototype._init = function(windowClone, parentActor){
        _function.apply(this, arguments);
        windowClone.actor.connect('enter-event', Lang.bind(this, function(){
            if (this._hidden){
                return;
            }
            _repositionTitle(this, true);
        }));
        windowClone.actor.connect('leave-event', Lang.bind(this, function(){
            if (this._hidden){
                return;
            }
            _repositionTitle(this, false);
        }));
    }
}

function _repositionTitle(WinOverlay, showFull) {
    let title = WinOverlay.title;
    let text = title.text;

    let [cloneX, cloneY] = WinOverlay._windowClone.actor.get_transformed_position();
    let [cloneWidth, cloneHeight] = WinOverlay._windowClone.actor.get_transformed_size();

    let titleWidth = title.width;
    //I need this to be able to know it's preferred size
    title.set_size(-1, -1);
    let [titleMinWidth, titleNatWidth] = title.get_preferred_width(-1);
    //I need this so that the animation go smooth
    title.width = titleWidth;

    //the problem with this approach is that it might not has the right parent on hide
    if (showFull){
        titleWidth = titleNatWidth;
        if (WinOverlay._parentActor.contains (title)){
            WinOverlay._parentActor.remove_child(title);
            Main.uiGroup.add_child(title);
        }
        Main.uiGroup.set_child_above_sibling (title,null);
    }else{
        titleWidth = Math.max(titleMinWidth, Math.min(titleNatWidth, cloneWidth));
        if (Main.uiGroup.contains (title)){
            Main.uiGroup.remove_child(title);
            WinOverlay._parentActor.add_child(title);
        }
    }

    let titleX = Math.round(cloneX + (cloneWidth - titleWidth) / 2);
    Tweener.addTween(title,{
        x: titleX,
        width: titleWidth,
        time: 0.1,
        transition: 'easeOutQuad',
    });
}
