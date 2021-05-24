/* eslint-disable no-multi-assign */
/* eslint-disable func-names */
/* eslint-disable prefer-const */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable consistent-return */
/* eslint-disable no-use-before-define */
/* eslint-disable lines-around-comment */
/* eslint-disable one-var */
import { event, classes, attr as attr$1, query } from 'min-dom';
import { create, attr, append, classes as classes$1, remove, clone } from 'tiny-svg';
import { assign, every, isObject, isNumber } from 'min-dash';
import cssEscape from 'css.escape';
import { getVisual } from 'diagram-js/lib/util/GraphicsUtil';

const MINIMAP_VIEWBOX_PADDING = 50;

let RANGE = { min: 0.2, max: 4 },
  NUM_STEPS = 10;

const DELTA_THRESHOLD = 0.1;

let LOW_PRIORITY = 250; /** * A minimap that reflects and lets you navigate the diagram. */
function Minimap(config, injector, eventBus, canvas, elementRegistry) {
  let self = this;
  this._canvas = canvas;
  this._elementRegistry = elementRegistry;
  this._eventBus = eventBus;
  this._injector = injector;

  this._state = {
    isOpen: undefined,
    isDragging: false,
    initialDragPosition: null,
    offsetViewport: null,
    cachedViewbox: null,
    dragger: null,
    svgClientRect: null,
    parentClientRect: null,
    zoomDelta: 0,
  };

  this._init();

  this.toggle((config && config.open) || false);

  function setViewboxCenteredAroundClickEvent(event) {
    // getBoundingClientRect might return zero-dimensional when called for the first time
    if (!self._state._svgClientRect || isZeroDimensional(self._state._svgClientRect)) {
      self._state._svgClientRect = self._svg.getBoundingClientRect();
    }

    let diagramPoint = mapMousePositionToDiagramPoint(
      {
        x: event.clientX - self._state._svgClientRect.left,
        y: event.clientY - self._state._svgClientRect.top,
      },
      self._svg,
      self._lastViewbox,
    );
    setViewboxCenteredAroundPoint(diagramPoint, self._canvas);

    self._update();
  }

  // set viewbox on click
  event.bind(this._svg, 'click', function (event) {
    event.preventDefault();
    event.stopPropagation();

    setViewboxCenteredAroundClickEvent(event);
  });

  function mousedown(center) {
    return function onMousedown(event$1) {
      // getBoundingClientRect might return zero-dimensional when called for the first time
      if (!self._state._svgClientRect || isZeroDimensional(self._state._svgClientRect)) {
        self._state._svgClientRect = self._svg.getBoundingClientRect();
      }

      if (center) {
        setViewboxCenteredAroundClickEvent(event$1);
      }

      let diagramPoint = mapMousePositionToDiagramPoint(
        {
          x: event$1.clientX - self._state._svgClientRect.left,
          y: event$1.clientY - self._state._svgClientRect.top,
        },
        self._svg,
        self._lastViewbox,
      );

      let viewbox = canvas.viewbox();

      let offsetViewport = getOffsetViewport(diagramPoint, viewbox);

      let initialViewportDomRect = self._viewportDom.getBoundingClientRect();

      // take border into account (regardless of width)
      let offsetViewportDom = {
        x: event$1.clientX - initialViewportDomRect.left + 1,
        y: event$1.clientY - initialViewportDomRect.top + 1,
      }; // init dragging
      assign(self._state, {
        cachedViewbox: viewbox,
        initialDragPosition: {
          x: event$1.clientX,
          y: event$1.clientY,
        },
        isDragging: true,
        offsetViewport,
        offsetViewportDom,
        viewportClientRect: self._viewport.getBoundingClientRect(),
        parentClientRect: self._parent.getBoundingClientRect(),
      });

      event.bind(document, 'mousemove', onMousemove);
      event.bind(document, 'mouseup', onMouseup);
    };
  }

  function onMousemove(event) {
    // set viewbox if dragging active
    if (self._state.isDragging) {
      // getBoundingClientRect might return zero-dimensional when called for the first time
      if (!self._state._svgClientRect || isZeroDimensional(self._state._svgClientRect)) {
        self._state._svgClientRect = self._svg.getBoundingClientRect();
      }

      // update viewport DOM
      let { offsetViewportDom } = self._state,
        { viewportClientRect } = self._state,
        { parentClientRect } = self._state;
      assign(self._viewportDom.style, {
        top: `${event.clientY - offsetViewportDom.y - parentClientRect.top}px`,
        left: `${event.clientX - offsetViewportDom.x - parentClientRect.left}px`,
      });

      // update overlay
      let clipPath = getOverlayClipPath(parentClientRect, {
        top: event.clientY - offsetViewportDom.y - parentClientRect.top,
        left: event.clientX - offsetViewportDom.x - parentClientRect.left,
        width: viewportClientRect.width,
        height: viewportClientRect.height,
      });
      assign(self._overlay.style, {
        clipPath,
      });

      let diagramPoint = mapMousePositionToDiagramPoint(
        {
          x: event.clientX - self._state._svgClientRect.left,
          y: event.clientY - self._state._svgClientRect.top,
        },
        self._svg,
        self._lastViewbox,
      );
      setViewboxCenteredAroundPoint(
        {
          x: diagramPoint.x - self._state.offsetViewport.x,
          y: diagramPoint.y - self._state.offsetViewport.y,
        },
        self._canvas,
      );
    }
  }

  function onMouseup(event$1) {
    if (self._state.isDragging) {
      // treat event as click
      if (
        self._state.initialDragPosition.x === event$1.clientX &&
        self._state.initialDragPosition.y === event$1.clientY
      ) {
        setViewboxCenteredAroundClickEvent(event$1);
      }

      self._update();

      // end dragging
      assign(self._state, {
        cachedViewbox: null,
        initialDragPosition: null,
        isDragging: false,
        offsetViewport: null,
        offsetViewportDom: null,
      });

      event.unbind(document, 'mousemove', onMousemove);
      event.unbind(document, 'mouseup', onMouseup);
    }
  }

  // dragging viewport scrolls canvas
  event.bind(this._viewportDom, 'mousedown', mousedown(false));
  event.bind(this._svg, 'mousedown', mousedown(true));

  event.bind(this._parent, 'wheel', function (event) {
    // stop propagation and handle scroll differently
    event.preventDefault();
    event.stopPropagation();

    // only zoom in on ctrl; this aligns with diagram-js navigation behavior
    if (!event.ctrlKey) {
      return;
    }

    // getBoundingClientRect might return zero-dimensional when called for the first time
    if (!self._state._svgClientRect || isZeroDimensional(self._state._svgClientRect)) {
      self._state._svgClientRect = self._svg.getBoundingClientRect();
    }

    // disallow zooming through viewport outside of minimap as it is very confusing
    if (!isPointInside(event, self._state._svgClientRect)) {
      return;
    }

    let factor = event.deltaMode === 0 ? 0.02 : 0.32;

    let delta =
      Math.sqrt(Math.pow(event.deltaY, 2) + Math.pow(event.deltaX, 2)) *
      sign(event.deltaY) *
      -factor; // add until threshold reached
    self._state.zoomDelta += delta;

    if (Math.abs(self._state.zoomDelta) > DELTA_THRESHOLD) {
      let direction = delta > 0 ? 1 : -1;

      let currentLinearZoomLevel = Math.log(canvas.zoom()) / Math.log(10);

      // zoom with half the step size of stepZoom
      let stepSize = getStepSize(RANGE, NUM_STEPS * 2);

      // snap to a proximate zoom step
      let newLinearZoomLevel = Math.round(currentLinearZoomLevel / stepSize) * stepSize; // increase or decrease one zoom step in the given direction
      newLinearZoomLevel += stepSize * direction;

      // calculate the absolute logarithmic zoom level based on the linear zoom level
      // (e.g. 2 for an absolute x2 zoom)
      let newLogZoomLevel = Math.pow(10, newLinearZoomLevel);
      canvas.zoom(cap(RANGE, newLogZoomLevel), diagramPoint);

      // reset
      self._state.zoomDelta = 0;

      let diagramPoint = mapMousePositionToDiagramPoint(
        {
          x: event.clientX - self._state._svgClientRect.left,
          y: event.clientY - self._state._svgClientRect.top,
        },
        self._svg,
        self._lastViewbox,
      );
      setViewboxCenteredAroundPoint(diagramPoint, self._canvas);

      self._update();
    }
  });

  event.bind(this._toggle, 'click', function (event) {
    event.preventDefault();
    event.stopPropagation();

    self.toggle();
  });

  // add shape on shape/connection added
  eventBus.on(['shape.added', 'connection.added'], function (context) {
    let { element } = context;
    self._addElement(element);

    self._update();
  });

  // remove shape on shape/connection removed
  eventBus.on(['shape.removed', 'connection.removed'], function (context) {
    let { element } = context;
    self._removeElement(element);

    self._update();
  });

  // update on elements changed
  eventBus.on('elements.changed', LOW_PRIORITY, function (context) {
    let { elements } = context;
    elements.forEach(function (element) {
      self._updateElement(element);
    });

    self._update();
  });

  // update on element ID update
  eventBus.on('element.updateId', function (context) {
    let { element } = context,
      { newId } = context;
    self._updateElementId(element, newId);
  });

  // update on viewbox changed
  eventBus.on('canvas.viewbox.changed', function () {
    if (!self._state.isDragging) {
      self._update();
    }
  });

  eventBus.on('canvas.resized', function () {
    // only update if present in DOM
    if (document.body.contains(self._parent)) {
      if (!self._state.isDragging) {
        self._update();
      }

      self._state._svgClientRect = self._svg.getBoundingClientRect();
    }
  });
}

Minimap.$inject = ['config.minimap', 'injector', 'eventBus', 'canvas', 'elementRegistry'];

Minimap.prototype._init = function () {
  let canvas = this._canvas,
    container = canvas.getContainer();

  // create parent div
  let parent = (this._parent = document.createElement('div'));
  classes(parent).add('djs-minimap');

  container.appendChild(parent);

  // create toggle
  let toggle = (this._toggle = document.createElement('div'));
  classes(toggle).add('toggle');

  parent.appendChild(toggle);

  // create map
  let map = (this._map = document.createElement('div'));
  classes(map).add('map');

  parent.appendChild(map);

  // create svg
  let svg = (this._svg = create('svg'));
  attr(svg, { width: '100%', height: '100%' });
  append(map, svg);

  // add groups
  let elementsGroup = (this._elementsGroup = create('g'));
  append(svg, elementsGroup);

  let viewportGroup = (this._viewportGroup = create('g'));
  append(svg, viewportGroup);

  // add viewport SVG
  let viewport = (this._viewport = create('rect'));
  classes$1(viewport).add('viewport');

  append(viewportGroup, viewport);

  // prevent drag propagation
  event.bind(parent, 'mousedown', function (event) {
    event.stopPropagation();
  });

  // add viewport DOM
  let viewportDom = (this._viewportDom = document.createElement('div'));
  classes(viewportDom).add('viewport-dom');

  this._parent.appendChild(viewportDom);

  // add overlay
  let overlay = (this._overlay = document.createElement('div'));
  classes(overlay).add('overlay');

  this._parent.appendChild(overlay);
};

Minimap.prototype._update = function () {
  let viewbox = this._canvas.viewbox(),
    innerViewbox = viewbox.inner,
    outerViewbox = viewbox.outer;
  if (!validViewbox(viewbox)) {
    return;
  }

  let x, y, width, height;

  let widthDifference = outerViewbox.width - innerViewbox.width,
    heightDifference = outerViewbox.height - innerViewbox.height; // update viewbox  // x
  if (innerViewbox.width < outerViewbox.width) {
    x = innerViewbox.x - widthDifference / 2;
    width = outerViewbox.width;

    if (innerViewbox.x + innerViewbox.width < outerViewbox.width) {
      x = Math.min(0, innerViewbox.x);
    }
  } else {
    x = innerViewbox.x;
    width = innerViewbox.width;
  }

  // y
  if (innerViewbox.height < outerViewbox.height) {
    y = innerViewbox.y - heightDifference / 2;
    height = outerViewbox.height;

    if (innerViewbox.y + innerViewbox.height < outerViewbox.height) {
      y = Math.min(0, innerViewbox.y);
    }
  } else {
    y = innerViewbox.y;
    height = innerViewbox.height;
  }

  // apply some padding
  x -= MINIMAP_VIEWBOX_PADDING;
  y -= MINIMAP_VIEWBOX_PADDING;
  width += MINIMAP_VIEWBOX_PADDING * 2;
  height += MINIMAP_VIEWBOX_PADDING * 2;

  this._lastViewbox = {
    x,
    y,
    width,
    height,
  };

  attr(this._svg, {
    viewBox: `${x}, ${y}, ${width}, ${height}`,
  });

  // update viewport SVG
  attr(this._viewport, {
    x: viewbox.x,
    y: viewbox.y,
    width: viewbox.width,
    height: viewbox.height,
  });

  // update viewport DOM
  let parentClientRect = (this._state._parentClientRect = this._parent.getBoundingClientRect());
  let viewportClientRect = this._viewport.getBoundingClientRect();

  let withoutParentOffset = {
    top: viewportClientRect.top - parentClientRect.top,
    left: viewportClientRect.left - parentClientRect.left,
    width: viewportClientRect.width,
    height: viewportClientRect.height,
  };
  assign(this._viewportDom.style, {
    top: `${withoutParentOffset.top}px`,
    left: `${withoutParentOffset.left}px`,
    width: `${withoutParentOffset.width}px`,
    height: `${withoutParentOffset.height}px`,
  });

  // update overlay
  let clipPath = getOverlayClipPath(parentClientRect, withoutParentOffset);
  assign(this._overlay.style, {
    clipPath,
  });
};

Minimap.prototype.open = function () {
  assign(this._state, { isOpen: true });

  classes(this._parent).add('open');

  let translate =
    this._injector.get('translate', false) ||
    function (s) {
      return s;
    };
  attr$1(this._toggle, 'title', translate('Close minimap'));

  this._update();

  this._eventBus.fire('minimap.toggle', { open: true });
};

Minimap.prototype.close = function () {
  assign(this._state, { isOpen: false });

  classes(this._parent).remove('open');

  let translate =
    this._injector.get('translate', false) ||
    function (s) {
      return s;
    };
  attr$1(this._toggle, 'title', translate('Open minimap'));

  this._eventBus.fire('minimap.toggle', { open: false });
};

Minimap.prototype.toggle = function (open) {
  let currentOpen = this.isOpen();
  if (typeof open === 'undefined') {
    open = !currentOpen;
  }

  if (open === currentOpen) {
    return;
  }

  if (open) {
    this.open();
  } else {
    this.close();
  }
};

Minimap.prototype.isOpen = function () {
  return this._state.isOpen;
};

Minimap.prototype._updateElement = function (element) {
  try {
    // if parent is null element has been removed, if parent is undefined parent is root
    if (element.parent !== undefined && element.parent !== null) {
      this._removeElement(element);
      this._addElement(element);
    }
  } catch (error) {
    console.warn('Minimap#_updateElement errored', error);
  }
};

Minimap.prototype._updateElementId = function (element, newId) {
  try {
    let elementGfx = query(`#${cssEscape(element.id)}`, this._elementsGroup);
    if (elementGfx) {
      elementGfx.id = newId;
    }
  } catch (error) {
    console.warn('Minimap#_updateElementId errored', error);
  }
};

/**
 * Adds an element to the minimap.
 */
Minimap.prototype._addElement = function (element) {
  let self = this;
  this._removeElement(element);

  let parent, x, y;

  let newElementGfx = this._createElement(element);
  let newElementParentGfx = query(`#${cssEscape(element.parent.id)}`, this._elementsGroup);
  if (newElementGfx) {
    let elementGfx = this._elementRegistry.getGraphics(element);
    let parentGfx = this._elementRegistry.getGraphics(element.parent);

    let index = getIndexOfChildInParentChildren(elementGfx, parentGfx); // index can be 0
    if (index !== 'undefined') {
      if (newElementParentGfx) {
        // in cases of doubt add as last child
        if (newElementParentGfx.childNodes.length > index) {
          insertChildAtIndex(newElementGfx, newElementParentGfx, index);
        } else {
          insertChildAtIndex(
            newElementGfx,
            newElementParentGfx,
            newElementParentGfx.childNodes.length - 1,
          );
        }
      } else {
        this._elementsGroup.appendChild(newElementGfx);
      }
    } else {
      // index undefined
      this._elementsGroup.appendChild(newElementGfx);
    }

    if (isConnection(element)) {
      parent = element.parent;
      x = 0;
      y = 0;

      if (typeof parent.x !== 'undefined' && typeof parent.y !== 'undefined') {
        x = -parent.x;
        y = -parent.y;
      }

      attr(newElementGfx, { transform: `translate(${x} ${y})` });
    } else {
      x = element.x;
      y = element.y;

      if (newElementParentGfx) {
        parent = element.parent;

        x -= parent.x;
        y -= parent.y;
      }

      attr(newElementGfx, { transform: `translate(${x} ${y})` });
    }

    if (element.children && element.children.length) {
      element.children.forEach(function (child) {
        self._addElement(child);
      });
    }

    return newElementGfx;
  }
};

Minimap.prototype._removeElement = function (element) {
  let elementGfx = this._svg.getElementById(element.id);
  if (elementGfx) {
    remove(elementGfx);
  }
};

Minimap.prototype._createElement = function (element) {
  let gfx = this._elementRegistry.getGraphics(element),
    visual;
  if (gfx) {
    visual = getVisual(gfx);

    if (visual) {
      let elementGfx = clone(visual);
      attr(elementGfx, { id: element.id });

      return elementGfx;
    }
  }
};

function isConnection(element) {
  return element.waypoints;
}

function getOffsetViewport(diagramPoint, viewbox) {
  let centerViewbox = {
    x: viewbox.x + viewbox.width / 2,
    y: viewbox.y + viewbox.height / 2,
  };
  return {
    x: diagramPoint.x - centerViewbox.x,
    y: diagramPoint.y - centerViewbox.y,
  };
}

function mapMousePositionToDiagramPoint(position, svg, lastViewbox) {
  // firefox returns 0 for clientWidth and clientHeight
  let boundingClientRect = svg.getBoundingClientRect();

  // take different aspect ratios of default layers bounding box and minimap into account
  let bBox = fitAspectRatio(lastViewbox, boundingClientRect.width / boundingClientRect.height);

  // map click position to diagram position
  let diagramX = map(position.x, 0, boundingClientRect.width, bBox.x, bBox.x + bBox.width),
    diagramY = map(position.y, 0, boundingClientRect.height, bBox.y, bBox.y + bBox.height);
  return {
    x: diagramX,
    y: diagramY,
  };
}

function setViewboxCenteredAroundPoint(point, canvas) {
  // get cached viewbox to preserve zoom
  let cachedViewbox = canvas.viewbox(),
    cachedViewboxWidth = cachedViewbox.width,
    cachedViewboxHeight = cachedViewbox.height;
  canvas.viewbox({
    x: point.x - cachedViewboxWidth / 2,
    y: point.y - cachedViewboxHeight / 2,
    width: cachedViewboxWidth,
    height: cachedViewboxHeight,
  });
}

function fitAspectRatio(bounds, targetAspectRatio) {
  let aspectRatio = bounds.width / bounds.height;

  // assigning to bounds throws exception in IE11
  let newBounds = assign(
    {},
    {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    },
  );
  if (aspectRatio > targetAspectRatio) {
    // height needs to be fitted
    let height = newBounds.width * (1 / targetAspectRatio),
      y = newBounds.y - (height - newBounds.height) / 2;
    assign(newBounds, {
      y,
      height,
    });
  } else if (aspectRatio < targetAspectRatio) {
    // width needs to be fitted
    let width = newBounds.height * targetAspectRatio,
      x = newBounds.x - (width - newBounds.width) / 2;
    assign(newBounds, {
      x,
      width,
    });
  }

  return newBounds;
}

function map(x, inMin, inMax, outMin, outMax) {
  let inRange = inMax - inMin,
    outRange = outMax - outMin;
  return ((x - inMin) * outRange) / inRange + outMin;
}

/**
 * Returns index of child in children of parent.
 *
 * g
 * '- g.djs-element // parentGfx
 * '- g.djs-children
 *    '- g
 *       '-g.djs-element // childGfx
 */
function getIndexOfChildInParentChildren(childGfx, parentGfx) {
  let childrenGroup = query('.djs-children', parentGfx.parentNode);
  if (!childrenGroup) {
    return;
  }

  let childrenArray = [].slice.call(childrenGroup.childNodes);

  let indexOfChild = -1;
  childrenArray.forEach(function (childGroup, index) {
    if (query('.djs-element', childGroup) === childGfx) {
      indexOfChild = index;
    }
  });

  return indexOfChild;
}

function insertChildAtIndex(childGfx, parentGfx, index) {
  let childrenArray = [].slice.call(parentGfx.childNodes);

  let childAtIndex = childrenArray[index];
  parentGfx.insertBefore(childGfx, childAtIndex.nextSibling);
}

function isZeroDimensional(clientRect) {
  return clientRect.width === 0 && clientRect.height === 0;
}

function isPointInside(point, rect) {
  return (
    point.x > rect.left &&
    point.x < rect.left + rect.width &&
    point.y > rect.top &&
    point.y < rect.top + rect.height
  );
}

let sign =
  Math.sign ||
  function (n) {
    return n >= 0 ? 1 : -1;
  }; /** * Get step size for given range and number of steps. * * @param {Object} range - Range. * @param {number} range.min - Range minimum. * @param {number} range.max - Range maximum. */
function getStepSize(range, steps) {
  let minLinearRange = Math.log(range.min) / Math.log(10),
    maxLinearRange = Math.log(range.max) / Math.log(10);

  let absoluteLinearRange = Math.abs(minLinearRange) + Math.abs(maxLinearRange);
  return absoluteLinearRange / steps;
}

function cap(range, scale) {
  return Math.max(range.min, Math.min(range.max, scale));
}

function getOverlayClipPath(outer, inner) {
  let coordinates = [
    toCoordinatesString(inner.left, inner.top),
    toCoordinatesString(inner.left + inner.width, inner.top),
    toCoordinatesString(inner.left + inner.width, inner.top + inner.height),
    toCoordinatesString(inner.left, inner.top + inner.height),
    toCoordinatesString(inner.left, outer.height),
    toCoordinatesString(outer.width, outer.height),
    toCoordinatesString(outer.width, 0),
    toCoordinatesString(0, 0),
    toCoordinatesString(0, outer.height),
    toCoordinatesString(inner.left, outer.height),
  ].join(', ');
  return `polygon(${coordinates})`;
}

function toCoordinatesString(x, y) {
  return `${x}px ${y}px`;
}

function validViewbox(viewBox) {
  return every(viewBox, function (value) {
    // check deeper structures like inner or outer viewbox
    if (isObject(value)) {
      return validViewbox(value);
    }

    return isNumber(value) && isFinite(value);
  });
}

const index = {
  __init__: ['minimap'],
  minimap: ['type', Minimap],
};
export default index;
