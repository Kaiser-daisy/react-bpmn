import React from 'react';
import vkbeautify from 'vkbeautify';
import CodeMirrow from '@uiw/react-codemirror';
import 'codemirror/mode/xml/xml';
import 'codemirror/addon/selection/active-line';
import 'codemirror/lib/codemirror.css';
import styles from './index.less';

const XMLView = (props) => {
  const { XML } = props;
  const formatXml = vkbeautify.xml(XML.replace(/ns0:/g, 'flowable:'));
  return (
    <div className={styles.xmlView}>
      <CodeMirrow
        value={formatXml}
        options={{
          readOnly: true,
          lineWrap: true,
          lineNumbers: true,
          styleActiveLine: true, // 当前行背景高亮
          line: true,
          tabSize: 4,
          mode: 'application/xml',
        }}
      />
    </div>
  );
};
export default XMLView;
