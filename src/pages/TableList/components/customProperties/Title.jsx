const types = {
  'bpmn:Process': '流程设置',
  'bpmn:UserTask': '节点设置',
  'bpmn:EndEvent': '节点设置',
  'bpmn:StartEvent': '节点设置',
  'bpmn:SequenceFlow': '顺序流设置',
  'bpmn:ExclusiveGateway': '节点设置',
};

const renderPanelTitle = (type) => types[type] || '流程设置';
export default renderPanelTitle;
