/* eslint-disable func-names */
/*
 * @Description:
 * @Author: lishuai
 * @Date: 2021-04-12 11:28:45
 * @LastEditTime: 2021-04-12 16:06:21
 */
import { is, isAny } from 'bpmnlint-utils';

export default function () {
  function hasEndEvent(node) {
    const flowElement = node.flowElements || [];
    return flowElement.some((item) => is(item, 'bpmn:EndEvent'));
  }
  function check(node, reporter) {
    if (!isAny(node, ['bpmn:Process'])) {
      return;
    }
    if (!hasEndEvent(node)) {
      reporter.report(node.id, '流程缺少结束节点');
    }
  }
  return {
    check,
  };
}
