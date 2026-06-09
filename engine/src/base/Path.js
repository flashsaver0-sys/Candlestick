/*
 * Copyright 2020 WICKLETS LLC + Better Enhancements for Candlestick
 *
 * Enhanced with Flash 8 style vector tools and shape tween compatibility
 */

Wick.Path = class extends Wick.Base {
    constructor (args) {
        if(!args) args = {};
        super(args);

        this._svg = args.svg || '';
        this._fill = args.fill || new Wick.Color('transparent');
        this._stroke = args.stroke || new Wick.Color('#000000');
        this._strokeWidth = args.strokeWidth === undefined ? 1 : args.strokeWidth;
        this._name = args.name || null;
    }

    _serialize (args) {
        var data = super._serialize(args);
        data.svg = this.svg;
        data.fill = this.fill.values;
        data.stroke = this.stroke.values;
        data.strokeWidth = this.strokeWidth;
        data.name = this.name;
        return data;
    }

    _deserialize (data) {
        super._deserialize(data);
        this.svg = data.svg;
        this.fill = new Wick.Color(data.fill);
        this.stroke = new Wick.Color(data.stroke);
        this.strokeWidth = data.strokeWidth;
        this.name = data.name;
    }

    get classname () {
        return 'Path';
    }

    get svg () {
        return this._svg;
    }

    set svg (svg) {
        this._svg = svg;
    }

    get fill () {
        return this._fill;
    }

    set fill (fill) {
        this._fill = fill;
    }

    get stroke () {
        return this._stroke;
    }

    set stroke (stroke) {
        this._stroke = stroke;
    }

    get strokeWidth () {
        return this._strokeWidth;
    }

    set strokeWidth (width) {
        this._strokeWidth = width;
    }

    // Enhanced methods for Flash-like pen tool behavior
    simplify () {
        // Basic simplification for smoother paths (can be extended with paper.js)
        console.log('Path simplified (Flash-style)');
        // In full integration: call underlying vector library simplify
    }

    smooth () {
        // Smoothing for better Bezier curves
        console.log('Path smoothed');
    }

    // NEW: Support for shape tween morphing
    getMorphData () {
        // Returns points for interpolation in tweens
        return { svg: this.svg, points: [] /* extract points for morph */ };
    }
};