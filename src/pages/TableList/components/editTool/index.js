/*
 * @Description:
 * @Author: lishuai
 * @Date: 2021-03-02 20:17:48
 * @LastEditTime: 2021-04-13 11:44:29
 */
import React, { useState } from 'react';
import { message } from 'antd';
import {
  PlusCircleOutlined,
  MinusCircleOutlined,
  BorderBottomOutlined,
  RollbackOutlined,
  RetweetOutlined,
  FolderOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import styles from './index.less';

const EditingTools = (props) => {
  const [scale, setSacle] = useState(1);
  const { modeler, onSave } = props;

  const handleRedo = () => {
    modeler.get('commandStack').redo();
  };

  const handleUndo = () => {
    modeler.get('commandStack').undo();
  };

  const handleZoom = (radio) => {
    const newScale = !radio ? 1.0 : scale + radio <= 0.2 ? 0.2 : scale + radio;

    modeler.get('canvas').zoom(newScale);
    setSacle(newScale);
  };

  const validateDiagrame = () => {
    const linting = modeler.get('linting');
    linting.toggle();
  };

  const saveDiagram = () => {
    const linting = modeler.get('linting');

    const { _button, _active } = linting;
    if (_active) {
      linting.toggle();
      return;
    }
    const { innerText } = _button;
    const errorTexts = Number(innerText.split(' Errors')[0]);
    if (errorTexts > 0) {
      return;
    }
    onSave();
  };

  return (
    <ul className={styles.controlList}>
      <li onClick={() => saveDiagram()} title="保存" className={styles.control}>
        <FolderOutlined />
        <span style={{ paddingLeft: '6px' }}>保存</span>
      </li>
      <li onClick={() => handleZoom(0.1)} title="放大" className={styles.control}>
        <PlusCircleOutlined />
        <span style={{ paddingLeft: '6px' }}>放大</span>
      </li>
      <li onClick={() => handleZoom(-0.1)} title="缩小" className={styles.control}>
        <MinusCircleOutlined />
        <span style={{ paddingLeft: '6px' }}>缩小</span>
      </li>
      <li onClick={() => handleZoom()} title="重置大小" className={styles.control}>
        <BorderBottomOutlined />
        <span style={{ paddingLeft: '6px' }}>重置大小</span>
      </li>
      <li onClick={handleUndo} title="撤销" className={styles.control}>
        <RollbackOutlined />
        <span style={{ paddingLeft: '6px' }}>撤销</span>
      </li>
      <li onClick={handleRedo} title="恢复" className={`${styles.control} ${styles.line}`}>
        <RetweetOutlined />
        <span style={{ paddingLeft: '6px' }}>恢复</span>
      </li>
      <li onClick={() => validateDiagrame()} title="验证" className={styles.control}>
        <CheckCircleOutlined />
        <span style={{ paddingLeft: '6px' }}>验证</span>
      </li>
    </ul>
  );
};

export default EditingTools;
