/* eslint-disable func-names */
/* eslint-disable no-underscore-dangle */
import { assign } from 'min-dash';
import inherits from 'inherits';
import ContextPadProvider from 'bpmn-js/lib/features/context-pad/ContextPadProvider';
import { is } from 'bpmn-js/lib/util/ModelUtil';

function CustomContextPadProvider(injector, connect, translate) {
  injector.invoke(ContextPadProvider, this);
  const elementFactory = this._elementFactory;
  const create = this._create;
  const autoPlace = this._autoPlace;
  const modeling = this._modeling;

  this.getContextPadEntries = function (element) {
    const actions = {};
    const { businessObject } = element;

    function startConnect(event, ele, autoActivate) {
      connect.start(event, ele, autoActivate);
    }

    function removeElement() {
      modeling.removeElements([element]);
    }

    function appendAction(type, className, title, options) {
      let newTitle = title;
      let newOptions = options;
      if (typeof title !== 'string') {
        newOptions = title;
        newTitle = translate('Append {type}', { type: type.replace(/^bpmn:/, '') });
      }
      function appendStart(event, ele) {
        const shape = elementFactory.createShape(assign({ type }, newOptions));
        create.start(event, shape, { source: ele });
      }

      function appendStart1(_, ele) {
        const shape = elementFactory.createShape(assign({ type }, newOptions));
        autoPlace.append(ele, shape);
      }

      const append = autoPlace ? appendStart1 : appendStart;
      const shortType = type.replace(/^bpmn:/, '');
      return {
        group: 'model',
        className,
        title: translate(newTitle || 'Create {type}', { type: shortType } || 'Append {type}', {
          type: shortType,
        }),
        action: {
          dragstart: appendStart,
          click: append,
        },
      };
    }
    if (element.type === 'label') {
      assign(actions, {});
    } else if (element.type !== 'label') {
      /*  开始节点 */
      if (is(businessObject, 'bpmn:StartEvent')) {
        assign(actions, {
          'append.gateway': appendAction(
            'bpmn:ExclusiveGateway',
            'bpmn-icon-gateway-xor',
            translate('Append ExclusiveGateway'),
          ),
          'append.user-task': appendAction(
            'bpmn:UserTask',
            'bpmn-icon-user-task',
            translate('Append UserTask'),
          ),
        });
      } else if (is(businessObject, 'bpmn:ExclusiveGateway')) {
        /*  网关 */
        assign(actions, {
          'append.user-task': appendAction(
            'bpmn:UserTask',
            'bpmn-icon-user-task',
            translate('Append UserTask'),
          ),
        });
      } else if (is(businessObject, 'bpmn:UserTask')) {
        /* 任务节点 */
        assign(actions, {
          'append.gateway': appendAction(
            'bpmn:ExclusiveGateway',
            'bpmn-icon-gateway-xor',
            translate('Append ExclusiveGateway'),
          ),
          'append.user-task': appendAction(
            'bpmn:UserTask',
            'bpmn-icon-user-task',
            translate('Append UserTask'),
          ),
          'append.end-event': appendAction(
            'bpmn:EndEvent',
            'bpmn-icon-end-event-none',
            translate('Append EndEvent'),
          ),
        });
      }
      if (!is(businessObject, 'bpmn:EndEvent') && !is(businessObject, 'bpmn:SequenceFlow')) {
        /* 连线 */
        assign(actions, {
          connect: {
            group: 'connect',
            className: 'bpmn-icon-connection-multi',
            title: translate('Append Sequence'),
            action: {
              click: startConnect,
              dragstart: startConnect,
            },
          },
        });
      }
      assign(actions, {
        /* 删除 */
        delete: {
          group: 'edit',
          className: 'bpmn-icon-trash',
          title: translate('Remove'),
          action: {
            click: removeElement,
          },
        },
      });
    }
    return actions;
  };
}

inherits(CustomContextPadProvider, ContextPadProvider);
CustomContextPadProvider.$inject = ['injector', 'connect', 'translate', 'elementFactory'];
export default CustomContextPadProvider;
