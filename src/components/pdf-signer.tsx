import { useState } from "react";
import { UploadPDF } from "./upload-pdf"
import { PdfViewer } from "./pdf-viewer";
import { Modal } from "./modal";
import { PdfSignerProps } from "../types";

export const PdfSigner = ({ onPdfClick, className, modalClassName, children }: PdfSignerProps) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Solo se permiten archivos PDF.");
      return;
    }

    const fileUrl = URL.createObjectURL(file);
    setPdfUrl(fileUrl);
    setIsModalOpen(true);
    setError(null);
  };

  const handlePdfClick = (x: number, y: number, page: number) => {
    onPdfClick({ x, y, page });
    setIsModalOpen(false);
  };

  return (
    <>
      <UploadPDF onFileChange={handleFileChange} className={className} children={children} />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <Modal
        title="Firmar PDF"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className={modalClassName}
      >
        <PdfViewer pdfUrl={pdfUrl!} onPdfClick={handlePdfClick} />
      </Modal>
    </>
  )
}
