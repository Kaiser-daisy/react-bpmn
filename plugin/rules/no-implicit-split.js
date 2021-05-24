/* eslint-disable func-names */
/*
 * @Description:
 * @Author: lishuai
 * @Date: 2021-04-12 17:24:28
 * @LastEditTime: 2021-04-12 17:30:37
 */
import { isAny } from 'bpmnlint-utils';

export default function () {
  function hasCondition(flow) {
    return !!flow.conditionExpression;
  }

  function isDefaultFlow(node, flow) {
    return node.default === flow;
  }

  function check(node, reporter) {
    if (!isAny(node, ['bpmn:Task', 'bpmn:Event'])) {
      return;
    }
    const outgoing = node.outgoing || [];
    const outgoingWithoutCondition = outgoing.filter((flow) => {
      return !hasCondition(flow) && !isDefaultFlow(node, flow);
    });
    if (outgoingWithoutCondition.length > 1) {
      reporter.report(node.id, '存在无条件隐式拆分');
    }
  }
  return { check };
}
