/* eslint-disable func-names */
/*
 * @Description:
 * @Author: lishuai
 * @Date: 2021-04-12 14:17:31
 * @LastEditTime: 2021-04-12 14:23:56
 */
import { is, isAny } from 'bpmnlint-utils';

export default function () {
  function check(node, reporter) {
    if (is(node, 'bpmn:SequenceFlow')) {
      return;
    }
    if (
      isAny(node, ['bpmn:StartEvent', 'bpmn:EndEvent', 'bpmn:UserTask', 'bpmn:ExclusiveGateway'])
    ) {
      const name = (node.name || '').trim();
      if (name.length === 0) {
        reporter.report(node.id, '节点缺少名称');
      }
    }
  }
  return { check };
}
