Wick.Timeline = class extends Wick.Base {
    constructor (args) {
        if(!args) args = {};
        super(args);

        this.layers = [];
        this.playheadPosition = args.playheadPosition || 1;
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

    get activeLayer () {
        return this.layers[this._activeLayerIndex];
    }

    get activeLayerIndex () {
        return this._activeLayerIndex;
    }

    set activeLayerIndex (index) {
        if(index < 0) index = 0;
        if(index >= this.layers.length) index = this.layers.length - 1;
        this._activeLayerIndex = index;
    }

    // Guide integration
    updateAllGuidesAndMasks() {
        this.layers.forEach(layer => {
            if (layer.isGuide) layer.updateGuidedLayers();
            if (layer.isMask) layer.updateMaskedLayers();
        });
    }

    // ... keep all other original methods (addLayer, removeLayer, moveLayer, etc.)
};
