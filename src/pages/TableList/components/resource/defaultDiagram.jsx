/*
 * @Description:
 * @Author: lishuai
 * @Date: 2021-03-02 19:30:30
 * @LastEditTime: 2021-03-12 17:41:07
 */
export const defaultDiagramXML = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI" xmlns:flowable="http://flowable.org/bpmn" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:ns0="undefined" targetNamespace="http://www.flowable.org/processdef">
  <process id="bpm-process-default" name="默认审批流程" isExecutable="true">
    <documentation>审批流程</documentation>
    <startEvent id="Event_06s5ncu" name="开始节点">
      <outgoing>Flow_0lt9f3s</outgoing>
    </startEvent>
    <userTask id="Activity_0gvwq2v" name="一级审批">
      <incoming>Flow_0lt9f3s</incoming>
      <extensionElements>
         <flowable:customProperties candidateUserList="admin" />
      </extensionElements>
      <outgoing>Flow_1swbiw1</outgoing>
    </userTask>
    <sequenceFlow id="Flow_0lt9f3s" sourceRef="Event_06s5ncu" targetRef="Activity_0gvwq2v" />
    <endEvent id="Event_0vqzu19" name="结束节点">
      <incoming>Flow_1swbiw1</incoming>
    </endEvent>
    <sequenceFlow id="Flow_1swbiw1" sourceRef="Activity_0gvwq2v" targetRef="Event_0vqzu19" />
  </process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_pig-process-bpm-dataservice">
    <bpmndi:BPMNPlane id="BPMNPlane_pig-process-bpm-dataservice" bpmnElement="bpm-process-default">
      <bpmndi:BPMNEdge id="Flow_0lt9f3s_di" bpmnElement="Flow_0lt9f3s">
        <omgdi:waypoint x="318" y="200" />
        <omgdi:waypoint x="460" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1swbiw1_di" bpmnElement="Flow_1swbiw1">
        <omgdi:waypoint x="560" y="200" />
        <omgdi:waypoint x="682" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="Event_06s5ncu_di" bpmnElement="Event_06s5ncu">
        <omgdc:Bounds x="282" y="182" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <omgdc:Bounds x="279" y="221" width="43" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0gvwq2v_di" bpmnElement="Activity_0gvwq2v">
        <omgdc:Bounds x="460" y="160" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_0vqzu19_di" bpmnElement="Event_0vqzu19">
        <omgdc:Bounds x="682" y="182" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <omgdc:Bounds x="679" y="221" width="43" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>`;
