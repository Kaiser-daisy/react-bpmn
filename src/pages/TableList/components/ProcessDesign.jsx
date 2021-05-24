/* eslint-disable no-underscore-dangle */
import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { message, Modal } from 'antd';
import request from 'umi-request';
import lintModule from 'bpmn-js-bpmnlint';
import CustomModeler from './customModeler';
import CustomProperties from './customProperties';
import flowableModdle from './js/flowable.json';
import minimapModule from './js/minimap';
import EditingTools from './editTool';
import bpmnlintConfig from '../../../../.bpmnlintrc';
import styles from './index.less';

const ProcessDesign = (props) => {
  const modelerRef = useRef(null);
  const [activeNodeEle, setActiveNode] = useState(null);
  const { XML, childRef } = props;

  const addModelerListener = () => {
    const bpmnjs = modelerRef.current;
    const events = ['element.click', 'element.changed'];
    events.forEach((eventType) => {
      bpmnjs.on(eventType, (e) => {
        const { element } = e;
        const { type } = element;
        if (type !== 'label') {
          setActiveNode(element);
        }
      });
    });
  };

  const initActiveNode = () => {
    const canvas = modelerRef.current.get('canvas');
    const rootElement = canvas.getRootElement();
    setActiveNode(rootElement);
  };

  const renderDiagram = () => {
    modelerRef.current.importXML(XML, (err) => {
      if (err) {
        Modal.error({ title: 'XML解析失败' });
        return false;
      }
      initActiveNode();
      return true;
    });
  };

  useEffect(() => {
    modelerRef.current = new CustomModeler({
      container: '#bpmnContainer',
      propertiesPanel: {
        parent: '#properties-panel',
      },
      additionalModules: [
        {
          zoomScroll: ['value', ''],
          labelEditingProvider: ['value', ''],
        },
        lintModule,
        minimapModule,
      ],
      linting: {
        bpmnlint: bpmnlintConfig,
      },
      moddleExtensions: {
        flowable: flowableModdle,
      },
    });
    const logo = document.querySelector('.bjs-powered-by');
    const bpmnContainer = document.querySelector('.bjs-container');
    if (bpmnContainer && logo) {
      bpmnContainer.removeChild(logo);
    }
    renderDiagram();
    addModelerListener();
  }, []);

  const updateBpmn = (value) => {
    const modeling = modelerRef.current.get('modeling');
    if (activeNodeEle) {
      modeling.updateProperties(activeNodeEle, value);
    }
  };

  const propertiesProps = {
    modeler: modelerRef.current,
    updateProperties: updateBpmn,
    activeNodeEle,
  };

  const getBpmnXML = () => {
    const bpmnModeler = modelerRef.current;
    return new Promise((resolve, reject) => {
      if (bpmnModeler._customElements != null && bpmnModeler._customElements.length > 0) {
        // 将自定义的元素 加入到 _definitions
        bpmnModeler._definitions.rootElements[0].flowElements = bpmnModeler._definitions.rootElements[0].flowElements.concat(
          bpmnModeler._customElements[0],
        );
      }
      bpmnModeler.saveXML({ format: true }, (err, xml) => {
        if (err) {
          reject(err);
        }
        resolve(xml);
      });
    });
  };

  const saveBpmnXML = async () => {
    const xml = await getBpmnXML();
    request
      .post('/api/saveBPMN', {
        data: {
          xml,
        },
      })
      .then((res) => {
        if (res.code === 0) {
          message.success('保存成功');
        }
      });
  };

  useImperativeHandle(childRef, () => {
    return {
      getXML: getBpmnXML,
    };
  });

  return (
    <>
      <div className={styles.editToolContainer}>
        <EditingTools onSave={saveBpmnXML} modeler={modelerRef.current} />
      </div>
      <div className={styles.processContainer}>
        <div className={styles.bpmnContainer} id="bpmnContainer" />
        <aside className={styles.aside}>
          <div className={styles.panelContainer} id="properties-panel">
            <CustomProperties {...propertiesProps} />
          </div>
        </aside>
      </div>
    </>
  );
};

export default forwardRef(ProcessDesign);
