/*
 * Copyright 2020 WICKLETS LLC + Enhancements for Candlestick
 *
 * Enhanced Tween with better Flash 8 style features: more easings + basic Shape Tween support
 */

Wick.Tween = class extends Wick.Base {
    static get VALID_EASING_TYPES () {
        return ['none', 'in', 'out', 'in-out', 'elastic-in', 'elastic-out', 'bounce-in', 'bounce-out', 'back-in', 'back-out'];
    }

    static _calculateTimeValue (tweenA, tweenB, playheadPosition) {
        var tweenAPlayhead = tweenA.playheadPosition;
        var tweenBPlayhead = tweenB.playheadPosition;
        var dist = tweenBPlayhead - tweenAPlayhead;
        var t = (playheadPosition - tweenAPlayhead) / dist;
        return Math.max(0, Math.min(1, t)); // Clamp
    }

    /**
     * Create a tween
     */
    constructor (args) {
        if(!args) args = {};
        super(args);

        this._playheadPosition = args.playheadPosition || 1;
        this._transformation = args.transformation || new Wick.Transformation();
        this.fullRotations = args.fullRotations === undefined ? 0 : args.fullRotations;
        this.easingType = args.easingType || 'none';
        
        // === NEW: Shape Tween Support ===
        this.isShapeTween = args.isShapeTween || false;
        this.shapeMorphData = args.shapeMorphData || null; // For storing path morph points

        this._originalLayerIndex = -1;
    }

    /**
     * Create interpolated tween (improved)
     */
    static interpolate (tweenA, tweenB, playheadPosition) {
        var interpTween = new Wick.Tween();

        var t = Wick.Tween._calculateTimeValue(tweenA, tweenB, playheadPosition);
        var tweenFn = tweenA._getTweenFunction();

        const props = ["x", "y", "scaleX", "scaleY", "rotation", "opacity"];
        props.forEach(propName => {
            let tt = tweenFn(t);
            let valA = tweenA.transformation[propName];
            let valB = tweenB.transformation[propName];

            if (propName === 'rotation') {
                valB += tweenA.fullRotations * 360;
            }

            interpTween.transformation[propName] = lerp(valA, valB, tt);
        });

        // NEW: Basic Shape Morph handling
        if (tweenA.isShapeTween && tweenB.isShapeTween && tweenA.shapeMorphData) {
            interpTween.isShapeTween = true;
            // Simple linear morph for paths (extend with paper.js Path morphing in renderer)
            interpTween.shapeMorphData = tweenA.shapeMorphData; // Renderer will handle interpolation
        }

        interpTween.playheadPosition = playheadPosition;
        return interpTween;
    }

    get classname () {
        return 'Tween';
    }

    _serialize (args) {
        var data = super._serialize(args);

        data.playheadPosition = this.playheadPosition;
        data.transformation = this._transformation.values;
        data.fullRotations = this.fullRotations;
        data.easingType = this.easingType;
        data.isShapeTween = this.isShapeTween;
        if (this.shapeMorphData) data.shapeMorphData = this.shapeMorphData;

        data.originalLayerIndex = this.layerIndex !== -1 ? this.layerIndex : this._originalLayerIndex;

        return data;
    }

    _deserialize (data) {
        super._deserialize(data);

        this.playheadPosition = data.playheadPosition;
        this._transformation = new Wick.Transformation(data.transformation);
        this.fullRotations = data.fullRotations;
        this.easingType = data.easingType;
        this.isShapeTween = data.isShapeTween || false;
        this.shapeMorphData = data.shapeMorphData || null;

        this._originalLayerIndex = data.originalLayerIndex;
    }

    get playheadPosition () { return this._playheadPosition; }
    set playheadPosition (v) { this._playheadPosition = v; }

    get transformation () { return this._transformation; }
    set transformation (t) { this._transformation = t; }

    get easingType () { return this._easingType; }
    set easingType (type) {
        if (Wick.Tween.VALID_EASING_TYPES.indexOf(type) === -1) {
            console.warn('Invalid easingType. Valid:', Wick.Tween.VALID_EASING_TYPES);
            return;
        }
        this._easingType = type;
    }

    remove () {
        this.parent.removeTween(this);
    }

    applyTransformsToClip (clip) {
        clip.transformation = this.transformation.copy();
    }

    getNextTween () {
        if (!this.parentFrame) return null;
        return this.parentFrame.seekTweenInFront(this.playheadPosition + 1);
    }

    restrictToFrameSize () {
        var p = this.playheadPosition;
        if (p < 1 || p > this.parentFrame.length) {
            this.remove();
        }
    }

    get layerIndex () {
        return this.parentLayer ? this.parentLayer.index : -1;
    }

    get originalLayerIndex () {
        return this._originalLayerIndex;
    }

    /* Enhanced easing functions */
    _getTweenFunction () {
        const easings = {
            'none': TWEEN.Easing.Linear.None,
            'in': TWEEN.Easing.Quadratic.In,
            'out': TWEEN.Easing.Quadratic.Out,
            'in-out': TWEEN.Easing.Quadratic.InOut,
            'elastic-in': TWEEN.Easing.Elastic.In,
            'elastic-out': TWEEN.Easing.Elastic.Out,
            'bounce-in': TWEEN.Easing.Bounce.In,
            'bounce-out': TWEEN.Easing.Bounce.Out,
            'back-in': TWEEN.Easing.Back.In,
            'back-out': TWEEN.Easing.Back.Out,
        };
        return easings[this.easingType] || TWEEN.Easing.Linear.None;
    }

    // NEW: Helper for shape tween creation (call from editor)
    static createShapeTween(startPath, endPath) {
        const tween = new Wick.Tween();
        tween.isShapeTween = true;
        tween.shapeMorphData = { start: startPath, end: endPath }; // Renderer uses this
        return tween;
    }
};
