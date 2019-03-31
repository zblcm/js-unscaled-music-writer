var ScrollHandler = {};
ScrollHandler.WIDTH = 15;

ScrollHandler.new_scroll = function(horizontal) {
    let scrollbar = {};
    PanelHandler.panelize(scrollbar);
    scrollbar.horizontal = horizontal || false;
    scrollbar.showing = false;
    scrollbar.on_scroll = null;

    // this function must be called before on_resize.
    scrollbar.update_size = function(total_length, canvas_length, scrollbar_length) {
        if (scrollbar.horizontal) scrollbar.size = new Point2(scrollbar_length, ScrollHandler.WIDTH);
        else scrollbar.size = new Point2(ScrollHandler.WIDTH, scrollbar_length);
        if (total_length > 0) {
            let ratio = canvas_length / total_length;
            if (ratio >= 1) scrollbar.hide();
            else {
                if (!scrollbar.showing) scrollbar.show();
                if (scrollbar.horizontal) {
                    scrollbar.drager.size = new Point2(ratio * scrollbar_length, ScrollHandler.WIDTH);
                    scrollbar.drager.set_line(scrollbar.position, new Point2(scrollbar.position.x + ((1 - ratio) * scrollbar_length), scrollbar.position.y));
                }
                else {
                    scrollbar.drager.size = new Point2(ScrollHandler.WIDTH, ratio * scrollbar_length);
                    scrollbar.drager.set_line(scrollbar.position, new Point2(scrollbar.position.x, scrollbar.position.y + ((1 - ratio) * scrollbar_length)));
                }

            }
        }
        else scrollbar.hide();
        if (scrollbar.showing) {
            let percent = scrollbar.drager.get_percent();
            if (percent < 0) percent = 0;
            if (percent > 1) percent = 1;
            scrollbar.drager.set_percent(percent);
            if (scrollbar.on_scroll) scrollbar.on_scroll(percent);
        }
        else if (scrollbar.on_scroll) scrollbar.on_scroll(0);

    };
/*
    scrollbar.add_on_resize(function() {
        if (scrollbar.horizontal)
            scrollbar.drager.set_line(scrollbar.position, new Point2(scrollbar.position.x + scrollbar.size.x - scrollbar.drager.size.x, scrollbar.position.y));
        else
            scrollbar.drager.set_line(scrollbar.position, new Point2(scrollbar.position.x, scrollbar.position.y + scrollbar.size.y - scrollbar.drager.size.y));
        let percent = scrollbar.drager.get_percent();
        if (percent < 0) percent = 0;
        if (percent > 1) percent = 1;
        scrollbar.drager.set_percent(percent);
    });
*/
    scrollbar.show = function() {
        scrollbar.showing = true;
        scrollbar.mouse_event = function(type, key, special) {scrollbar.drager.mouse_event(type, key, special)};
    };
    scrollbar.hide = function() {
        scrollbar.showing = false;
        scrollbar.drager.position = scrollbar.position.clone();
        scrollbar.drager.size = scrollbar.size.clone();
        scrollbar.mouse_event = null;
    };

    scrollbar.create_drager = function() {
        let drager = ButtonHandler.new_drager();
        scrollbar.drager = drager;
        scrollbar.add_child(scrollbar.drager);

        if (scrollbar.horizontal) drager.size = new Point2(0, ScrollHandler.WIDTH);
        else drager.size = new Point2(ScrollHandler.WIDTH, 0);
        drager.drag_callback = function() { if (scrollbar.on_scroll && scrollbar.showing) scrollbar.on_scroll(scrollbar.drager.get_percent()); };

        return drager;
    };
    scrollbar.create_drager();

    return scrollbar;
};

ScrollHandler.new_scale = function(horizontal, inverse) {
    let scale = {};
    PanelHandler.panelize(scale);
    ButtonHandler.buttonlize(scale);
    scale.horizontal = horizontal || false;
    scale.inverse = inverse || false;
    scale.current_ratio = 0;
    scale.on_scale = null;

    scale.ratio_to_pixel = function(ratio) {
        if (inverse) ratio = 1 - ratio;
        if (scale.horizontal) return ratio * scale.size.x + scale.position.x;
        else return ratio * scale.size.y + scale.position.y;
    };
    scale.pixel_to_ratio = function(pixel) {
        let ratio;
        if (scale.horizontal) ratio = (pixel - scale.position.x) / scale.size.x;
        else ratio = (pixel - scale.position.y) / scale.size.y;
        if (scale.inverse) return 1 - ratio;
        return ratio;
    };
    scale.pos_to_ratio = function(pos) {
        if (scale.horizontal) return scale.pixel_to_ratio(pos.x);
        else return scale.pixel_to_ratio(pos.y);
    };
    scale.adjust_scale = function() {
        scale.current_ratio = scale.pos_to_ratio(EventHandler.mouse_position);
        if (scale.current_ratio < 0) scale.current_ratio = 0;
        if (scale.current_ratio > 1) scale.current_ratio = 1;
        if (scale.on_scale) scale.on_scale();
    };
    scale.on_drag = scale.adjust_scale;
    scale.on_click = scale.adjust_scale;

    return scale;
};