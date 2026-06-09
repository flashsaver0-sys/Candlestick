/*
 * Copyright 2020 WICKLETS LLC + Grok Enhancements for Candlestick
 *
 * This file is part of Wick Engine.
 *
 * Wick Engine is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Wick Engine is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Represents a Wick Layer with Flash 8-style Mask support.
 */
Wick.Layer = class extends Wick.Base {
    /**
     * Called when creating a Wick Layer.
     */
    constructor (args) {
        if(!args) args = {};
        super(args);

        this.locked = args.locked === undefined ? false : args.locked;
        this.hidden = args.hidden === undefined ? false : args.hidden;
        this.opacity = args.opacity === undefined ? 1 : args.opacity;
        this.name = args.name || null;
        
        // === NEW: Flash 8 Mask Support ===
        this.isMask = args.isMask || false;
        this.maskTargetLayers = []; // Layers clipped by this mask
    }

    _serialize (args) {
        var data = super._serialize(args);

        data.locked = this.locked;
        data.hidden = this.hidden;
        data.opacity = this.opacity;
        data.isMask = this.isMask;  // Persist mask state in .wick files

        return data;
    }

    _deserialize (data) {
        super._deserialize(data);

        this.locked = data.locked;
        this.hidden = data.hidden;
        this.opacity = data.opacity;
        this.isMask = data.isMask || false;
    }

    get classname () {
        return 'Layer';
    }

    /**
     * The frames belonging to this layer.
     * @type {Wick.Frame[]}
     */
    get frames () {
        return this.getChildren('Frame');
    }

    /**
     * The order of the Layer in the timeline.
     * @type {number}
     */
    get index () {
        return this.parent && this.parent.layers.indexOf(this);
    }

    /**
     * The opacity of the layer.
     * @type {number}
     */
    get opacity () {
        return this._opacity;
    }
    set opacity (opacity) {
        if (typeof opacity === 'number' && !isNaN(opacity)) {
            this._opacity = Math.max(Math.min(opacity, 1), 0);
        }
        else this._opacity = 1;
    }

    /**
     * NEW: Set this layer as a Mask (Flash 8 behavior)
     * Call this from UI (right-click layer → Set as Mask)
     */
    setAsMask(isMask) {
        this.isMask = isMask;
        if (isMask) {
            this.updateMaskedLayers();
        } else {
            this.maskTargetLayers = [];
        }
        if (this.project) this.project.markAsDirty();
        return this;
    }

    /**
     * Update which layers are masked by this one (layers below until next mask)
     */
    updateMaskedLayers() {
        if (!this.parentTimeline) return;
        this.maskTargetLayers = [];
        const layers = this.parentTimeline.layers;
        const myIndex = layers.indexOf(this);
        for (let i = myIndex + 1; i < layers.length; i++) {
            const below = layers[i];
            if (below.isMask) break;  // Next mask stops this one (Flash style)
            this.maskTargetLayers.push(below);
        }
    }

    /**
     * Set this layer to be the active layer in its timeline.
     */
    activate () {
        this.parent.activeLayerIndex = this.index;
    }

    /**
     * True if this layer is the active layer in its timeline.
     * @type {boolean}
     */
    get isActive () {
        return this.parent && this === this.parent.activeLayer;
    }

    /**
     * The length of the layer in frames.
     * @type {number}
     */
    get length () {
        var end = 0;
        this.frames.forEach(function (frame) {
            if(frame.end > end) {
                end = frame.end;
            }
        });
        return end;
    }

    /**
     * The active frame on the layer.
     * @type {Wick.Frame}
     */
    get activeFrame () {
        if(!this.parent) return null;
        return this.getFrameAtPlayheadPosition(this.parent.playheadPosition);
    }

    move (index) {
        this.parentTimeline.moveLayer(this, index);
    }

    remove () {
        this.parentTimeline.removeLayer(this);
    }

    addFrame (frame) {
        this.addChild(frame);
        this.resolveOverlap([frame]);
        this.resolveGaps([frame]);
    }

    addTween (tween) {
        this.activeFrame && this.activeFrame.addChild(tween);
    }

    insertBlankFrame (playheadPosition) {
        if(!playheadPosition) {
            throw new Error('insertBlankFrame: playheadPosition is required');
        }

        var frame = new Wick.Frame({start: playheadPosition});
        this.addChild(frame);

        var existingFrame = this.getFrameAtPlayheadPosition(playheadPosition);
        if (existingFrame) {
            frame.end = existingFrame.end;
        }

        this.resolveOverlap([frame]);
        this.resolveGaps([frame]);

        return frame;
    }

    removeFrame (frame) {
        this.removeChild(frame);
        this.resolveGaps();
    }

    getFrameAtPlayheadPosition (playheadPosition) {
        return this.frames.find(frame => {
            return frame.inPosition(playheadPosition);
        }) || null;
    }

    getFramesInRange (playheadPositionStart, playheadPositionEnd) {
        return this.frames.filter(frame => {
            return frame.inRange(playheadPositionStart, playheadPositionEnd);
        });
    }

    getFramesContainedWithin (playheadPositionStart, playheadPositionEnd) {
        return this.frames.filter(frame => {
            return frame.containedWithin(playheadPositionStart, playheadPositionEnd);
        });
    }

    resolveOverlap (newOrModifiedFrames) {
        newOrModifiedFrames = newOrModifiedFrames || [];

        newOrModifiedFrames.forEach(frame => {
            if(frame.start <= 1) {
                frame.start = 1;
            }
        });

        var isEdible = existingFrame => {
            return newOrModifiedFrames.indexOf(existingFrame) === -1;
        };

        newOrModifiedFrames.forEach(frame => {
            var containedFrames = this.getFramesContainedWithin(frame.start, frame.end);
            containedFrames.filter(isEdible).forEach(existingFrame => {
                existingFrame.remove();
            });

            this.frames.filter(isEdible).forEach(existingFrame => {
                if(existingFrame.inPosition(frame.start) && existingFrame.start !== frame.start) {
                    existingFrame.end = frame.start - 1;
                }
            });

            this.frames.filter(isEdible).forEach(existingFrame => {
                if(existingFrame.inPosition(frame.end) && existingFrame.end !== frame.end) {
                    existingFrame.start = frame.end + 1;
                }
            });
        });
    }

    resolveGaps (newOrModifiedFrames) {
        if(this.parentTimeline && this.parentTimeline.waitToFillFrameGaps) return;

        newOrModifiedFrames = newOrModifiedFrames || [];

        var fillGapsMethod = this.parentTimeline && this.parentTimeline.fillGapsMethod;
        if(!fillGapsMethod) fillGapsMethod = 'blank_frames';

        this.findGaps().forEach(gap => {
            if(fillGapsMethod === 'auto_extend') {
                var frameOnLeft = this.getFrameAtPlayheadPosition(gap.start-1);
                if(!frameOnLeft || newOrModifiedFrames.indexOf(frameOnLeft) !== -1 || gap.start === 1) {
                    var empty = new Wick.Frame({
                        start: gap.start,
                        end: gap.end,
                    });
                    this.addFrame(empty);
                } else {
                    frameOnLeft.end = gap.end;
                }
            }

            if(fillGapsMethod === 'blank_frames') {
                var empty = new Wick.Frame({
                    start: gap.start,
                    end: gap.end,
                });
                this.addFrame(empty);
            }
        });
    }

    findGaps () {
        var gaps = [];

        var currentGap = null;
        for(var i = 1; i <= this.length; i++) {
            var frame = this.getFrameAtPlayheadPosition(i);

            if(!frame && !currentGap) {
                currentGap = {};
                currentGap.start = i;
            }

            if(frame && currentGap) {
                currentGap.end = i-1;
                gaps.push(currentGap);
                currentGap = null;
            }
        }

        return gaps;
    }

    // === NEW: Enhanced Rendering with Mask Clipping ===
    render(ctx, project) {
        if (this.hidden) return;

        if (this.isMask) {
            ctx.save();
            // Draw mask content (shapes/paths on this layer's frames)
            const activeFrame = this.activeFrame;
            if (activeFrame) {
                activeFrame.render(ctx, project);
            }
            ctx.clip();  // Flash-style clipping

            // Render masked layers inside the clip
            this.maskTargetLayers.forEach(layer => {
                layer.renderWithoutMask(ctx, project);
            });

            ctx.restore();
            return;
        }

        // Normal layer render
        this.renderWithoutMask(ctx, project);
    }

    // Helper to avoid recursion in masks
    renderWithoutMask(ctx, project) {
        const activeFrame = this.activeFrame;
        if (activeFrame) {
            activeFrame.render(ctx, project);
        }
    }
};
