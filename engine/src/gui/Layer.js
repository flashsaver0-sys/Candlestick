/*
 * Copyright 2020 WICKLETS LLC + Better Enhancements for Candlestick
 *
 * Enhanced Tween with better Flash 8 style features: more easings + basic Shape Tween support
 */

Wick.GUIElement.Layer = class extends Wick.GUIElement {
    constructor (model) {
        super(model);

        this.cursor = 'pointer';
        this.canAutoScrollY = true;

        // Hide button
        this.hideButton = new Wick.GUIElement.LayerButton(model, {
            toggledTooltip: 'Show Layer',
            untoggledTooltip: 'Hide Layer',
            toggledIcon: 'show_layer',
            untoggledIcon: 'hide_layer',
            isToggledFn: () => { return this.model.hidden; },
            clickFn: () => {
                this.model.hidden = !this.model.hidden;
                this.model.activate();
                this.projectWasModified();
            }
        });

        // Lock button
        this.lockButton = new Wick.GUIElement.LayerButton(model, {
            toggledTooltip: 'Unlock Layer',
            untoggledTooltip: 'Lock Layer',
            toggledIcon: 'unlock_layer',
            untoggledIcon: 'lock_layer',
            isToggledFn: () => { return this.model.locked; },
            clickFn: () => {
                this.model.locked = !this.model.locked;
                this.model.activate();
                this.projectWasModified();
            }
        });

        // Mask button (Flash style)
        this.maskButton = new Wick.GUIElement.LayerButton(model, {
            toggledTooltip: 'Remove Mask',
            untoggledTooltip: 'Set as Mask',
            toggledIcon: 'mask_active',
            untoggledIcon: 'mask_inactive',
            isToggledFn: () => { return this.model.isMask; },
            clickFn: () => {
                this.model.setAsMask(!this.model.isMask);
                this.model.activate();
                this.projectWasModified();
            }
        });

        // === NEW: Guide button ===
        this.guideButton = new Wick.GUIElement.LayerButton(model, {
            toggledTooltip: 'Remove Guide',
            untoggledTooltip: 'Set as Guide',
            toggledIcon: 'guide_active',
            untoggledIcon: 'guide_inactive',
            isToggledFn: () => { return this.model.isGuide; },
            clickFn: () => {
                this.model.setAsGuide(!this.model.isGuide);
                this.model.activate();
                this.projectWasModified();
            }
        });
    }

    draw () {
        super.draw();

        var ctx = this.ctx;

        var width = Wick.GUIElement.LAYERS_CONTAINER_WIDTH - Wick.GUIElement.LAYER_LABEL_MARGIN_SIDES*2;
        var height = this.gridCellHeight - Wick.GUIElement.LAYER_LABEL_MARGIN_TOP_BOTTOM*2;

        if (this.model.hidden) {
            ctx.fillStyle = Wick.GUIElement.LAYER_LABEL_HIDDEN_FILL_COLOR;
        } else if (this.model.isActive) {
            ctx.fillStyle = Wick.GUIElement.LAYER_LABEL_ACTIVE_FILL_COLOR;
        } else {
            ctx.fillStyle = Wick.GUIElement.LAYER_LABEL_INACTIVE_FILL_COLOR;
        }

        ctx.save();
        ctx.translate(Wick.GUIElement.LAYER_LABEL_MARGIN_SIDES, Wick.GUIElement.LAYER_LABEL_MARGIN_TOP_BOTTOM);
            ctx.beginPath();
            ctx.roundRect(0, 0, width, height, Wick.GUIElement.LAYER_LABEL_BORDER_RADIUS);
            ctx.fill();
            ctx.stroke();
        ctx.restore();

        // Label
        ctx.save();
        ctx.font = "16px " + Wick.GUIElement.LAYER_LABEL_FONT_FAMILY;
        ctx.fillStyle = this.model.isActive ? Wick.GUIElement.LAYER_LABEL_ACTIVE_FONT_COLOR : Wick.GUIElement.LAYER_LABEL_INACTIVE_FONT_COLOR;
        ctx.fillText(this.model.name, 100, this.gridCellHeight / 2 + 6);
        ctx.restore();

        // Buttons
        ctx.save(); ctx.translate(10, this.gridCellHeight / 2); this.hideButton.draw(); ctx.restore();
        ctx.save(); ctx.translate(30, this.gridCellHeight / 2); this.lockButton.draw(); ctx.restore();
        ctx.save(); ctx.translate(50, this.gridCellHeight / 2); this.maskButton.draw(); ctx.restore();
        ctx.save(); ctx.translate(70, this.gridCellHeight / 2); this.guideButton.draw(); ctx.restore();
    }

    get bounds () {
        return { x: 0, y: 0, width: Wick.GUIElement.LAYERS_CONTAINER_WIDTH, height: this.gridCellHeight };
    }

    onMouseDown (e) {
        this.model.activate();
        this.model.project.selection.clear();
        this.model.project.selection.select(this.model);
        this.projectWasModified();
    }
};