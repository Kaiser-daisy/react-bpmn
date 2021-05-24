# React-BPMN

基于[ant-design](https://ant.design/index-cn)React UI 组件库使用 bpmn.js 集成工作流, 增加对 flowable 的支持。

## 环境准备

安装依赖 `node_modules`:

```bash
npm install / yarn install
```

### 说明

属性面板(properities-panel)使用 ant-design UI 组件自定义编写。

自定义属性面板实现示例:

```tsx
import React, { useEffect } from 'react';
import { Input, Form } from 'antd';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
const FormItem = Form.Item;

const Events = (props) => {
  const [form] = Form.useForm();
  const { activeNodeEle, updateProperties } = props;
  const nodeValues = getBusinessObject(activeNodeEle);
  useEffect(() => {
    form.setFieldsValue({
      id: nodeValues?.id,
      name: nodeValues?.name,
    });
  }, [form, nodeValues?.id, nodeValues?.name]);

  const valueChange = (value) => {
    updateProperties(value);
  };

  return (
    <Form
      form={form}
      key={nodeValues?.id}
      onValuesChange={(changedValues) => valueChange(changedValues)}
    >
      <FormItem label="节点ID" name="id" rules={[{ required: true }]}>
        <Input disabled />
      </FormItem>
      <FormItem label="节点名称" name="name" rules={[{ required: true }]}>
        <Input />
      </FormItem>
    </Form>
  );
};
export default Events;
```
