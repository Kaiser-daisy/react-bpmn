/* eslint-disable func-names */
/*
 * @Description:
 * @Author: lishuai
 * @Date: 2021-04-13 09:17:31
 * @LastEditTime: 2021-04-13 09:23:12
 */

function hasCondition(flow) {
  return !!flow.conditionExpression;
}

function isDefaultFlow(node, flow) {
  return node.default === flow;
}

function isConditionalForking(node) {
  const defaultFlow = node.default;
  const outgoing = node.outgoing || [];
  return defaultFlow || outgoing.find(hasCondition);
}

export default function () {
  function check(node, reporter) {
    if (!isConditionalForking(node)) {
      return;
    }
    const outgoing = node.outgoing || [];
    outgoing.forEach((flow) => {
      const missingCondition = !hasCondition(flow) && !isDefaultFlow(node, flow);
      if (missingCondition) {
        reporter.report(flow.id, '顺序流缺少条件');
      }
    });
  }
  return { check };
}
