import React, { useEffect } from 'react';
import { Input, Form } from 'antd';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

const layout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 16 },
};
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
      {...layout}
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
