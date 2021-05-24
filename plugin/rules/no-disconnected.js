/* eslint-disable func-names */
/*
 * @Description:
 * @Author: lishuai
 * @Date: 2021-04-12 16:16:58
 * @LastEditTime: 2021-04-12 16:46:22
 */
import { isAny } from 'bpmnlint-utils';

export default function () {
  function check(node, reporter) {
    if (!isAny(node, ['bpmn:Event']) || node.triggerByEvent) {
      return;
    }
    const incoming = node.incoming || [];
    const outgoing = node.outgoing || [];
    if (!incoming.length && !outgoing.length) {
      reporter.report(node.id, '元素没有连线');
    }
  }
  return { check };
}
