/*
 * @Description:
 * @Author: lishuai
 * @Date: 2021-04-12 10:55:34
 * @LastEditTime: 2021-04-13 10:08:35
 */
module.exports = {
  configs: {
    recommended: {
      rules: {},
    },
    all: {
      'playground/end-event-required': 'error',
      'playground/start-event-required': 'error',
      'playground/no-node-user': 'error',
      'playground/label-required': 'error',
      'playground/no-disconnected': 'error',
      'playground/no-implicit-split': 'warn',
      'playground/conditional-flows': 'error',
    },
  },
};
