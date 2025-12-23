import ReactDOM from 'react-dom';

const originalFindDOMNode = ReactDOM.findDOMNode;

if (!originalFindDOMNode) {
  ReactDOM.findDOMNode = function(componentOrElement) {
    if (componentOrElement == null) {
      return null;
    }

    if (componentOrElement.nodeType === 1) {
      return componentOrElement;
    }

    if (componentOrElement._reactInternals) {
      const fiber = componentOrElement._reactInternals;
      
      const findHostInstance = (fiberNode) => {
        if (!fiberNode) return null;
        
        if (fiberNode.tag === 5) {
          return fiberNode.stateNode;
        }
        
        let child = fiberNode.child;
        while (child) {
          const instance = findHostInstance(child);
          if (instance) return instance;
          child = child.sibling;
        }
        
        return null;
      };
      
      return findHostInstance(fiber);
    }

    if (componentOrElement instanceof Element) {
      return componentOrElement;
    }

    console.warn('findDOMNode polyfill: Unable to find DOM node for:', componentOrElement);
    return null;
  };
}

export default ReactDOM;
