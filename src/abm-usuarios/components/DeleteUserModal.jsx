function DeleteUserModal({ isOpen, onClose, onConfirm, userData }) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(userData);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-[#27353E2E] z-30"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 z-40 w-[560px] shadow-2xl">
        <h2 className="text-3xl font-normal mb-6">Eliminar Usuario</h2>

        <p className="text-gray-700 mb-2">
          Estás seguro de eliminar a{" "}
          <span className="font-medium">[{userData?.usuario}]</span> como
          usuario?
        </p>
        <p className="text-gray-700 mb-8">Esta acción no se puede revertir.</p>

        {/* Botones */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={onClose}
            className="flex-1 max-w-[180px] px-6 py-2 border-2 border-gray-400 rounded-full text-gray-700 hover:bg-gray-50 font-normal"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 max-w-[180px] px-6 py-2 bg-[#72BFDD] rounded-full text-white hover:bg-[#5fa8c4] font-normal"
          >
            Eliminar usuario
          </button>
        </div>
      </div>
    </>
  );
}

export default DeleteUserModal;
