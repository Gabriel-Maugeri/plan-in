import Modal from './common/Modal';
import Button from './common/Button';

function ConfirmChangeModal({ isOpen, onClose, onSave, onDiscard, currentViewName }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cambios sin guardar"
      size="w-[450px]"
    >
      <div className="space-y-4">
        <p className="text-gray-700">
          Tienes cambios sin guardar en la vista <strong>{currentViewName}</strong>.
        </p>
        <p className="text-gray-700">
          ¿Qué deseas hacer con estos cambios?
        </p>
        
        <div className="flex gap-3 pt-4">
          <Button
            onClick={onDiscard}
            variant="secondary"
            className="flex-1"
          >
            Descartar cambios
          </Button>
          <Button
            onClick={onSave}
            variant="primary"
            className="flex-1"
          >
            Guardar cambios
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmChangeModal;
