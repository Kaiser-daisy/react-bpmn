/* eslint-disable consistent-return */
/* eslint-disable func-names */
/*
 * @Description:
 * @Author: lishuai
 * @Date: 2021-04-12 11:38:19
 * @LastEditTime: 2021-04-12 17:08:33
 */
import { is } from 'bpmnlint-utils';
import { find } from 'lodash';

export default function () {
  function findValue(properties, name) {
    if (!properties) {
      return;
    }
    return properties[name];
  }

  function check(node, reporter) {
    if (is(node, 'bpmn:UserTask')) {
      const extensionEles = node.extensionElements;
      if (extensionEles) {
        const properties = find(extensionEles.get('values'), function (e) {
          return is(e, 'flowable:CustomProperties');
        });

        if (
          !findValue(properties, 'candidateRoleList') &&
          !findValue(properties, 'candidateUserList')
        ) {
          reporter.report(node.id, '任务节点未设置人员');
        }
      }
    }
  }
  return { check };
}
