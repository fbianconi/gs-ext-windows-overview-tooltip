
const Clutter = imports.gi.Clutter;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Workspace = imports.ui.workspace;
const Lang = imports.lang;

const St = imports.gi.St;
const Pango = imports.gi.Pango;


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
    if (WinOverlay._windowClone.inDrag)
        return;

    let title = WinOverlay.title;

    let [cloneX, cloneY] = WinOverlay._windowClone.actor.get_transformed_position();
    let [cloneWidth, cloneHeight] = WinOverlay._windowClone.actor.get_transformed_size();

    let titleOrigWidth = title.width, titleWidth = title.width;
    let titleOrigHeight = title.height, titleHeight = title.height;

    let ellipsized = title.clutter_text.get_layout().is_ellipsized();

    if (showFull && ellipsized){
        title.clutter_text.set_line_wrap(true);
        //TODO: find and use the actual constants
        //title.clutter_text.set_request_mode(Clutter.RequestMode.WIDTH_FOR_HEIGHT);
        let prop = 1.75; //proportional maximum

        title.set_size(-1, -1);
        let [titleMinHeight, titleNatHeight] = title.get_preferred_height(titleWidth*prop);
        title.set_size(-1, titleNatHeight);
        let [titleMinWidth, titleNatWidth] = title.get_preferred_width(titleNatHeight);

        title.clutter_text.set_line_alignment (1); //Pango.ALIGN_CENTER==1
        let lines = Math.ceil(titleNatWidth/(titleWidth*prop));

        titleWidth = ((Math.ceil(titleNatWidth/lines))+(titleWidth*prop))/2; //Math.min(titleWidth*prop, titleNatWidth);
        if (lines == 1) titleWidth = titleNatWidth;
        //TODO make a better guess?
        titleHeight = titleNatHeight;

    }else if (!showFull){
        title.clutter_text.set_line_wrap(false);
        title.set_size(-1, -1);
        let [titleMinHeight, titleNatHeight] = title.get_preferred_height(-1);
        let [titleMinWidth, titleNatWidth] = title.get_preferred_width(-1);
        titleHeight = titleNatHeight;
        titleWidth = Math.max(titleMinWidth, Math.min(titleNatWidth, cloneWidth));
    }else{
        return;
    }
    //I need this so that the animation go smooth
    title.width = titleOrigWidth;
    title.height = titleOrigHeight;
    title.raise_top();
    let titleX = Math.round(cloneX + (cloneWidth - titleWidth) / 2);
    let titleY = Math.round(cloneY + cloneHeight + title._spacing);

    Tweener.addTween(title,{
        x: titleX,
        y: titleY,
        width: titleWidth,
        height: titleHeight,
        time: 0.1,
        transition: 'easeOutQuad',
    });
}
