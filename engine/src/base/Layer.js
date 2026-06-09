/*
 * Copyright 2020 WICKLETS LLC + Better Enhancements for Candlestick
 *
 * Enhanced Tween with better Flash 8 style features: more easings + basic Shape Tween support
 */

Wick.Layer = class extends Wick.Base {
    constructor (args) {
        if(!args) args = {};
        super(args);

        this.locked = args.locked === undefined ? false : args.locked;
        this.hidden = args.hidden === undefined ? false : args.hidden;
        this.opacity = args.opacity === undefined ? 1 : args.opacity;
        this.name = args.name || null;
        
        // Flash 8 Mask Support
        this.isMask = args.isMask || false;
        this.maskTargetLayers = [];
        
        // Motion Guide Support
        this.isGuide = args.isGuide || false;
        this.guidedLayers = [];
    }

    _serialize (args) {
        var data = super._serialize(args);
        data.locked = this.locked;
        data.hidden = this.hidden;
        data.opacity = this.opacity;
        data.isMask = this.isMask;
        data.isGuide = this.isGuide;
        return data;
    }

    _deserialize (data) {
        super._deserialize(data);
        this.locked = data.locked;
        this.hidden = data.hidden;
        this.opacity = data.opacity !== undefined ? data.opacity : 1;
        this.isMask = data.isMask || false;
        this.isGuide = data.isGuide || false;
    }

    get classname () { return 'Layer'; }

    get frames () { return this.getChildren('Frame'); }

    get index () { return this.parent && this.parent.layers.indexOf(this); }

    get opacity () { return this._opacity; }
    set opacity (opacity) {
        if (typeof opacity === 'number' && !isNaN(opacity)) {
            this._opacity = Math.max(Math.min(opacity, 1), 0);
        } else this._opacity = 1;
    }

    setAsMask(isMask) {
        this.isMask = isMask;
        if (isMask) this.updateMaskedLayers();
        else this.maskTargetLayers = [];
        if (this.project) this.project.markAsDirty();
        return this;
    }

    updateMaskedLayers() {
        if (!this.parentTimeline) return;
        this.maskTargetLayers = [];
        const layers = this.parentTimeline.layers;
        const myIndex = layers.indexOf(this);
        for (let i = myIndex + 1; i < layers.length; i++) {
            const below = layers[i];
            if (below.isMask) break;
            this.maskTargetLayers.push(below);
        }
    }

    setAsGuide(isGuide) {
        this.isGuide = isGuide;
        if (isGuide) this.updateGuidedLayers();
        else this.guidedLayers = [];
        if (this.project) this.project.markAsDirty();
        return this;
    }

    updateGuidedLayers() {
        if (!this.parentTimeline) return;
        this.guidedLayers = [];
        const layers = this.parentTimeline.layers;
        const myIndex = layers.indexOf(this);
        for (let i = myIndex + 1; i < layers.length; i++) {
            const below = layers[i];
            if (below.isMask || below.isGuide) break;
            this.guidedLayers.push(below);
        }
    }

    render(ctx, project) {
        if (this.hidden) return;
        if (this.isMask) {
            ctx.save();
            const activeFrame = this.activeFrame;
            if (activeFrame) activeFrame.render(ctx, project);
            ctx.clip();
            this.maskTargetLayers.forEach(layer => layer.renderWithoutMask(ctx, project));
            ctx.restore();
            return;
        }
        this.renderWithoutMask(ctx, project);
    }

    renderWithoutMask(ctx, project) {
        const activeFrame = this.activeFrame;
        if (activeFrame) activeFrame.render(ctx, project);
    }

    activate () { this.parent.activeLayerIndex = this.index; }

    get isActive () { return this.parent && this === this.parent.activeLayer; }

    get length () {
        var end = 0;
        this.frames.forEach(frame => { if(frame.end > end) end = frame.end; });
        return end;
    }

    get activeFrame () {
        if(!this.parent) return null;
        return this.getFrameAtPlayheadPosition(this.parent.playheadPosition);
    }
};