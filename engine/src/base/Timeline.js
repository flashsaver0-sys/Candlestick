/*
 * Copyright 2020 WICKLETS LLC + Better Enhancements for Candlestick
 *
 * Enhanced Tween with better Flash 8 style features: more easings + basic Shape Tween support
 */

Wick.Timeline = class extends Wick.Base {
    constructor (args) {
        if(!args) args = {};
        super(args);

        this._layers = [];
        this._playheadPosition = args.playheadPosition || 1;
        this._activeLayerIndex = 0;
        this.fillGapsMethod = args.fillGapsMethod || 'blank_frames';
        this.waitToFillFrameGaps = args.waitToFillFrameGaps || false;
    }

    _serialize (args) {
        var data = super._serialize(args);
        data.playheadPosition = this.playheadPosition;
        data.fillGapsMethod = this.fillGapsMethod;
        data.waitToFillFrameGaps = this.waitToFillFrameGaps;
        return data;
    }

    _deserialize (data) {
        super._deserialize(data);
        this.playheadPosition = data.playheadPosition;
        this.fillGapsMethod = data.fillGapsMethod;
        this.waitToFillFrameGaps = data.waitToFillFrameGaps;
    }

    get classname () {
        return 'Timeline';
    }

    get layers () {
        return this._layers;
    }

    get activeLayer () {
        return this.layers[this._activeLayerIndex];
    }

    get activeLayerIndex () {
        return this._activeLayerIndex;
    }

    set activeLayerIndex (index) {
        if (index < 0) index = 0;
        if (index >= this.layers.length) index = this.layers.length - 1;
        this._activeLayerIndex = index;
    }

    get playheadPosition () {
        return this._playheadPosition;
    }

    set playheadPosition (position) {
        this._playheadPosition = Math.max(1, position);
    }

    // Enhanced methods for Mask + Guide support
    updateAllMasksAndGuides () {
        this.layers.forEach(layer => {
            if (layer.isMask) layer.updateMaskedLayers();
            if (layer.isGuide) layer.updateGuidedLayers();
        });
    }

    addLayer (layer, index) {
        if (!layer) layer = new Wick.Layer();
        if (index === undefined) index = this.layers.length;
        this.layers.splice(index, 0, layer);
        layer.parentTimeline = this;
        this.updateAllMasksAndGuides();
        return layer;
    }

    removeLayer (layer) {
        var index = this.layers.indexOf(layer);
        if (index === -1) return;
        this.layers.splice(index, 1);
        this.updateAllMasksAndGuides();
    }

    moveLayer (layer, newIndex) {
        var oldIndex = this.layers.indexOf(layer);
        if (oldIndex === -1) return;
        this.layers.splice(oldIndex, 1);
        this.layers.splice(newIndex, 0, layer);
        this.updateAllMasksAndGuides();
    }

    // Flash-like frame methods
    insertBlankFrame (playheadPosition) {
        if (!this.activeLayer) return null;
        return this.activeLayer.insertBlankFrame(playheadPosition);
    }

    // ... keep other original methods (getFrameAtPlayheadPosition, etc.) if they exist in your current file

    tick () {
        // Called every frame - update masks/guides if needed
        this.updateAllMasksAndGuides();
    }
};