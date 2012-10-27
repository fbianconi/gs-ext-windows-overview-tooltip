
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Workspace = imports.ui.workspace;
const Lang = imports.lang;
const St = imports.gi.St;


let _function = null;

function init() {

}

function disable() {
    _hideTooltip();
    Workspace.WindowOverlay.prototype._init = _function;
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

function _on_enter(WinOverlay){
    if (WinOverlay._hidden){
        return;
    }
    _showTooltip(WinOverlay);
    // TODO check if the pointer is still inside
}

function _on_leave(WinOverlay){
    _hideTooltip();
    return;
    if (WinOverlay._hidden){
        return;
    }

    let [cloneX,cloneY] = WinOverlay._windowClone.actor.get_transformed_position();
    let [cloneWidth,cloneHeight] = WinOverlay._windowClone.actor.get_transformed_size();

    let titleWidth = Math.floor(Math.min(WinOverlay.title.fullWidth, cloneWidth));
    let titleX = Math.floor(cloneX + (cloneWidth - titleWidth) / 2);
    Tweener.addTween(WinOverlay.title,{
        width: titleWidth,
        x: titleX,
        time: .150,
        transition: 'easeOutQuad'
    });
}

let _label;
const TOOLTIP_LABEL_SHOW_TIME = 0.15;
const TOOLTIP_LABEL_HIDE_TIME = 0.1;

function _showTooltip(WinOverlay) {
    let text = WinOverlay.title.text;
    let should_display = WinOverlay.title.get_clutter_text().get_layout().is_ellipsized();

    if (!should_display) return;

    if (!_label) {
        _label = new St.Label({
            style_class: 'tooltip dash-label',
            text: text
        });
        Main.uiGroup.add_actor(_label);
    }else{
        _label.text = text;
    }

    let [stageX, stageY] = WinOverlay._windowClone.actor.get_transformed_position();
    let [width, height] = WinOverlay._windowClone.actor.get_transformed_size();

    let y = stageY + height - 25;
    let x = stageX - Math.round((_label.get_width() - width)/2);
    _label.opacity = 0;
    _label.set_position(x, y);
    Tweener.addTween(_label,{
        opacity: 255,
        time: TOOLTIP_LABEL_SHOW_TIME,
        transition: 'easeOutQuad',
    });
}

function _hideTooltip() {
    if (_label){
        Tweener.addTween(_label, {
            opacity: 0,
            time: TOOLTIP_LABEL_HIDE_TIME,
            transition: 'easeOutQuad',
            onComplete: function() {
                Main.uiGroup.remove_actor(_label);
                _label = null;
            }
        });
    }
}

