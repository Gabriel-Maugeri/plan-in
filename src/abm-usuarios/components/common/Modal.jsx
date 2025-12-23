function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = "w-[960px]",
  height = "auto"
}) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-[#27353E2E] z-30"
        onClick={onClose}
      />
      <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 z-40 ${maxWidth} ${height !== 'auto' ? height : ''} max-h-[90vh] overflow-y-auto shadow-2xl`}>
        {title && (
          <h2 className="text-3xl font-normal mb-8 text-center">
            {title}
          </h2>
        )}
        {children}
      </div>
    </>
  );
}

export default Modal;
