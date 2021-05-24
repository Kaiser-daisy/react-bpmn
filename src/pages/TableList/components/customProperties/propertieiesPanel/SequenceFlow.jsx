import React, { useEffect } from 'react';
import { Input, Form } from 'antd';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
const FormItem = Form.Item;
const { TextArea } = Input;

const SequenceFlow = (props) => {
  const [form] = Form.useForm();
  const { activeNodeEle, updateProperties, modeler } = props;
  const nodeValues = getBusinessObject(activeNodeEle);
  const { conditionExpression } = nodeValues || {};
  useEffect(() => {
    form.setFieldsValue({
      id: nodeValues?.id,
      name: nodeValues?.name,
      condition: conditionExpression?.body,
    });
  }, [conditionExpression?.body, form, nodeValues?.id, nodeValues?.name]);

  const valueChange = (value) => {
    const keys = Object.keys(value);
    const moddle = modeler.get('moddle');
    if (keys.includes('condition')) {
      const newCondition = moddle.create('bpmn:FormalExpression', {
        body: value.condition,
      });
      updateProperties({ conditionExpression: newCondition });
    } else if (keys.includes('name')) {
      updateProperties(value);
    }
  };

  return (
    <Form
      {...layout}
      form={form}
      key={nodeValues?.id}
      onValuesChange={(changedValues) => valueChange(changedValues)}
    >
      <FormItem label="ID" name="id" rules={[{ required: true }]}>
        <Input disabled />
      </FormItem>
      <FormItem label="名称" name="name">
        <Input />
      </FormItem>
      <FormItem label="条件" name="condition">
        <TextArea autoSize={{ minRows: 2, maxRows: 2 }} placeholder="请填写JUEL表达式" />
      </FormItem>
    </Form>
  );
};
export default SequenceFlow;
