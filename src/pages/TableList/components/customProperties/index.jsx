import React from 'react';
import { Tabs } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import renderPanelTitle from './Title';
import RenderPanel from './propertieiesPanel';

const { TabPane } = Tabs;

const CustomProperties = (props) => {
  const { activeNodeEle = {} } = props;
  const { type } = activeNodeEle || {};
  return (
    <Tabs type="card">
      <TabPane
        tab={
          <span>
            <SettingOutlined />
            {renderPanelTitle(type)}
          </span>
        }
      >
        <RenderPanel {...props} />
      </TabPane>
    </Tabs>
  );
};
export default CustomProperties;
