/* eslint-disable camelcase */
import Events from './Event';
import Process from './Process';
import SequenceFlow from './SequenceFlow';
import Task from './Task';

const RenderPanel = (props) => {
  const { activeNodeEle = {} } = props;
  const { type } = activeNodeEle || {};
  const panels = {
    'bpmn:Process': <Process {...props} />,
    'bpmn:StartEvent': <Events {...props} />,
    'bpmn:EndEvent': <Events {...props} />,
    'bpmn:SequenceFlow': <SequenceFlow {...props} />,
    'bpmn:ExclusiveGateway': <Events {...props} />,
    'bpmn:UserTask': <Task {...props} />,
  };
  const panelComponent = panels[type] || <Process {...props} />;
  return <div>{panelComponent}</div>;
};
export default RenderPanel;
