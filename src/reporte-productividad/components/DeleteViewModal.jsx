import Modal from './common/Modal';
import Button from './common/Button';

function DeleteViewModal({ isOpen, onClose, onConfirm, viewName }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar vista"
      size="w-[450px]"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-700">
          ¿Estás seguro que querés eliminar la vista seleccionada? Esta acción no puede revertirse. 
          Para recuperarla tendrás que crear una nueva con las mismas variables.
        </p>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onConfirm}
            className="flex-1"
          >
            Eliminar vista
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default DeleteViewModal;
