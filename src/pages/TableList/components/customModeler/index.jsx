/* eslint-disable func-names */
/* eslint-disable no-underscore-dangle */
import Modeler from 'bpmn-js/lib/Modeler';
import inherits from 'inherits';
import 'bpmn-js/dist/assets/diagram-js.css'; // 节点栏样式
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import 'bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css';
import CustomPalette from '../customPalette';
import CustomTranslate from '../customTranslate';
import CustomContextPad from '../customContextPad';

function CustomModeler(options) {
  Modeler.call(this, options);
  this._customElements = [];
}
inherits(CustomModeler, Modeler);

CustomModeler.prototype._modules = [].concat(CustomModeler.prototype._modules, [
  CustomPalette,
  CustomTranslate,
  CustomContextPad,
]);

CustomModeler.prototype.getCustomElements = function () {
  return this.customElements;
};

export default CustomModeler;
