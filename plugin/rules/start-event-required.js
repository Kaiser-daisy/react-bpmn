/* eslint-disable func-names */
/*
 * @Description:
 * @Author: lishuai
 * @Date: 2021-04-12 11:23:14
 * @LastEditTime: 2021-04-12 14:25:29
 */
import { is, isAny } from 'bpmnlint-utils';

export default function () {
  function hasStartEvent(node) {
    const flowElement = node.flowElements || [];
    return flowElement.some((item) => is(item, 'bpmn:StartEvent'));
  }
  function check(node, reporter) {
    if (!isAny(node, ['bpmn:Process'])) {
      return;
    }
    if (!hasStartEvent(node)) {
      reporter.report(node.id, '流程缺少开始节点');
    }
  }
  return {
    check,
  };
}
