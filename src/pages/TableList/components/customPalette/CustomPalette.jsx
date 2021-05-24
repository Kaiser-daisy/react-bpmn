/* eslint-disable func-names */
/* eslint-disable no-underscore-dangle */

import { assign } from 'min-dash';

function PaletteProvider(
  palette,
  create,
  elementFactory,
  spaceTool,
  lassoTool,
  globalConnect,
  translate,
) {
  this._create = create;
  this._elementFactory = elementFactory;
  this._spaceTool = spaceTool;
  this._lassoTool = lassoTool;
  this._globalConnect = globalConnect;
  this._translate = translate;

  palette.registerProvider(this);
}

PaletteProvider.$inject = [
  'palette',
  'create',
  'elementFactory',
  'spaceTool',
  'lassoTool',
  'globalConnect',
  'translate',
];

PaletteProvider.prototype.getPaletteEntries = function () {
  const actions = {};
  const create = this._create;
  const elementFactory = this._elementFactory;
  const translate = this._translate;
  const spaceTool = this._spaceTool;
  const lassoTool = this._lassoTool;
  const globalConnect = this._globalConnect;

  function createAction(type, group, className, title, options) {
    function createListener(event) {
      const shape = elementFactory.createShape(assign({ type }), options);
      if (options) {
        shape.businessObject.di.isExpanded = options.isExpanded;
      }
      create.start(event, shape);
    }
    const shortType = type.replace(/^bpmn:/, '');
    return {
      group,
      className,
      title: translate(title || `Create ${shortType}`),
      action: {
        dragstart: createListener,
        click: createListener,
      },
    };
  }

  assign(actions, {
    'lasso-tool': {
      group: 'tools',
      className: 'bpmn-icon-lasso-tool',
      title: translate('Activate the lasso tool'),
      action: {
        click(event) {
          lassoTool.activateSelection(event);
        },
      },
    },
    'space-tool': {
      group: 'tools',
      className: 'bpmn-icon-space-tool',
      title: translate('Activate the create/remove space tool'),
      action: {
        click(event) {
          spaceTool.activateSelection(event);
        },
      },
    },
    'create.start-event': createAction(
      'bpmn:StartEvent',
      'event',
      'bpmn-icon-start-event-none',
      'Create StartEvent',
    ),
    'create.end-event': createAction(
      'bpmn:EndEvent',
      'event',
      'bpmn-icon-end-event-none',
      'Create EndEvent',
    ),
    'create.exclusive-gateway': createAction(
      'bpmn:ExclusiveGateway',
      'gateway',
      'bpmn-icon-gateway-xor',
      'Exclusive Gateway',
    ),
    'create.user-task': createAction(
      'bpmn:UserTask',
      'activity',
      'bpmn-icon-user-task',
      'User Task',
    ),
  });

  return actions;
};

export default PaletteProvider;
