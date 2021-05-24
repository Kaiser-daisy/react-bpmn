import React, { useState, useEffect, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Tabs } from 'antd';
import request from 'umi-request';
import { setRoleList, setUserList } from '@/utils/utils';
import { defaultDiagramXML } from './resource/defaultDiagram';
import ProcessDesign from './ProcessDesign';
import XMLView from './XMLView';

const { TabPane } = Tabs;

const BpmnProcess = () => {
  const [bpmnXML, setXML] = useState(defaultDiagramXML);
  const childRef = useRef(null);
  const getXML = async () => {
    const response = await request('/api/process/detail', {
      method: 'get',
    });
    if (response && response.processXml) {
      setXML(response.processXml);
    }
  };

  const fetchUserList = () => {
    request('/api/getUserList').then((values) => {
      const { data } = values;
      setUserList(JSON.stringify(data));
    });
  };

  const fetchRoleList = () => {
    request('/api/getRoleList').then((values) => {
      const { data } = values;
      setRoleList(JSON.stringify(data));
    });
  };

  useEffect(() => {
    getXML();
    fetchUserList();
    fetchRoleList();
  }, []);

  const tabsChange = async (key) => {
    if (key !== '2') {
      return false;
    }
    const { current } = childRef;
    if (current) {
      const xml = await current.getXML();
      setXML(xml);
    }
  };

  return (
    <PageContainer>
      <Tabs onChange={(avtiveKey) => tabsChange(avtiveKey)} defaultActiveKey="1">
        <TabPane key="1" tab="流程设计">
          <ProcessDesign childRef={childRef} XML={bpmnXML} />
        </TabPane>
        <TabPane key="2" tab="XML">
          <XMLView XML={bpmnXML} />
        </TabPane>
      </Tabs>
    </PageContainer>
  );
};
export default BpmnProcess;
