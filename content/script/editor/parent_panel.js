var ParentPanel = {};

ParentPanel.init = function() {
    ParentPanel.create_panel();
    EventHandler.panels.push(ParentPanel.panel);
    DoubleBuff.on_resize = ParentPanel.panel.on_resize;

    MenuHandler.create_panel();
    ParentPanel.panel.add_child(MenuHandler.panel);

    InstrumentHandler.create_container();
    ParentPanel.panel.add_child(InstrumentHandler.panel);

    Editor.init();
    Editor.create_panel();
    ParentPanel.panel.add_child(Editor.panel);

    ParentPanel.panel.on_resize();
    Editor.update_canvas_size();
};

ParentPanel.create_panel = function() {
    let panel = {};
    ParentPanel.panel = panel;
    PanelHandler.panelize(panel);

    panel.fillcolor = ColorHandler.COLOR_THEME_0;
    panel.add_on_resize(function() { panel.size = DoubleBuff.size.clone(); });

    return panel;
};