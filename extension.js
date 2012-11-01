
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
    //WindowOverlay gets are created and deleted every time.
}

function enable() {
    _function = Workspace.WindowOverlay.prototype._init;
    Workspace.WindowOverlay.prototype._init = function(windowClone, parentActor){
        _function.apply(this, arguments);
        windowClone.actor.connect('enter-event', Lang.bind(this, function(){
            _on_enter(this);
        }));
        windowClone.actor.connect('leave-event', Lang.bind(this, function(){
            _on_leave(this);
        }));
    }
}

function _on_enter(actor){
    if (actor._hidden){
        return;
    }
    _repositionTitle(actor, true);
}

function _on_leave(actor){
    if (actor._hidden){
        return;
    }
    _repositionTitle(actor, false);
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

    if (showFull){
        titleWidth = titleNatWidth;
    }else{
        titleWidth = Math.max(titleMinWidth, Math.min(titleNatWidth, cloneWidth));
    }

    let titleX = Math.round(cloneX + (cloneWidth - titleWidth) / 2);
    Tweener.addTween(title,{
        x: titleX,
        width: titleWidth,
        time: 0.1,
        transition: 'easeOutQuad',
    });
}
