import { useEffect, useRef, useState } from "react";
import { Document, Page } from "react-pdf"
import { Button } from "./button"
import { Modal } from "./modal"
import { Document as DocumentIcon } from "../icons/Document";
import { Eye } from "../icons/Eye";
import { Download } from "../icons/Download";
import { Loader } from "../icons/Loader";
import { ChevronLeft } from "../icons/ChevronLeft";
import { ChevronRight } from "../icons/ChevronRight";
import { ZoomOut } from "../icons/ZoomOut";
import { ZoomIn } from "../icons/ZoomIn";

interface PdfData {
  id: number;
  name: string;
  data: string; // Base64 encoded PDF data
}

const samplePdfs = [
  { id: 1, name: "Sample Document 1", data: "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlIC9DYXRhbG9nCi9QYWdlcyAyIDAgUgo+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlIC9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxCj4+CmVuZG9iagozIDAgb2JqCjw8L1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Pj4KL0NvbnRlbnRzIDQgMCBSCj4+CmVuZG9iago0IDAgb2JqCjw8L0xlbmd0aCAzMQo+PgpzdHJlYW0KQlQKL0YxIDI0IFRmCjEwMCA3MDAgVGQKKChIZWxsbywgd29ybGQhKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDExNiAwMDAwMCBuIAowMDAwMDAwMDYzIDAwMDAwIG4gCjAwMDAwMDAxNDggMDAwMDAgbiAKMDAwMDAwMDMwNSAwMDAwMCBuIAp0cmFpbGVyCjw8L1Jvb3QgMSAwIFIKL1NpemUgNQo+PgpzdGFydHhyZWYKNDIyCiUlRU9G" },
  { id: 2, name: "User Manual", data: "base64EncodedPdfData2" },
  { id: 3, name: "Technical Specification", data: "base64EncodedPdfData3" },
]

export const ShowPdfsList = () => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<PdfData | null>(null);

  const downloadPdf = (pdfData: string, fileName: string) => {
    const linkSource = `data:application/pdf;base64,${pdfData}`
    const downloadLink = document.createElement("a")
    downloadLink.href = linkSource
    downloadLink.download = fileName
    downloadLink.click()
  }

  const handleSelectPdf = (pdf: PdfData) => {
    setSelectedPdf(pdf)
  }

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        <DocumentIcon className="h-4 w-4 text-gray-600" />
        <span>Mostar PDFs</span>
      </Button>

      <Modal
        title="Lista de PDFs"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        {
          selectedPdf ? (
            <SelectedPdf pdf={selectedPdf} onClose={() => setSelectedPdf(null)} />
          ) : (
            <PdfsList
              pdfs={samplePdfs}
              onSelectPdf={handleSelectPdf}
              onDownloadPdf={(pdf) => downloadPdf(pdf.data, pdf.name)}
            />
          )
        }
      </Modal>
    </>
  )
}

interface SelectedPdfProps {
  pdf: PdfData;
  onClose: () => void;
}

export const SelectedPdf = ({ pdf, onClose }: SelectedPdfProps) => {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageInputValue, setPageInputValue] = useState<string>("1")
  const [scale, setScale] = useState<number>(1.0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pageInputRef = useRef<HTMLInputElement>(null)

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setIsLoading(false)
  }

  const onDocumentLoadError = (error: Error) => {
    console.error("Error loading PDF:", error)
    setError("Error al cargar el PDF. Por favor, inténtelo de nuevo.")
    setIsLoading(false)
  }

  const onPageLoadSuccess = () => {
    setIsLoading(false)
  }

  const onPageLoadError = (error: Error) => {
    console.error("Error loading page:", error)
    setError(`Error al cargar la página ${currentPage}. Por favor, inténtelo de nuevo.`)
    setIsLoading(false)
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (numPages && currentPage < numPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInputValue(e.target.value)
  }

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handlePageInputSubmit()
    }
  }

  const handlePageInputSubmit = () => {
    const pageNumber = Number.parseInt(pageInputValue, 10)
    if (!isNaN(pageNumber) && numPages && pageNumber >= 1 && pageNumber <= numPages) {
      setCurrentPage(pageNumber)
    } else {
      // Reset to current page if invalid
      setPageInputValue(currentPage.toString())
    }
  }

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3))
  }

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5))
  }

  // Reset loading state when changing pages
  useEffect(() => {
    setIsLoading(true)
    setError(null)
    setPageInputValue(currentPage.toString())
  }, [currentPage])

  return (
    <div>
      <div className="pdf-viewer flex flex-col h-full my-4">
        <div className="flex justify-between items-center py-4 border-b bg-gray-50">

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-lg font-semibold">{pdf.name}</h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage <= 1 || isLoading}
              className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-2">
              <div className="relative flex items-center">
                <input
                  ref={pageInputRef}
                  type="text"
                  value={pageInputValue}
                  onChange={handlePageInputChange}
                  onKeyDown={handlePageInputKeyDown}
                  onBlur={handlePageInputSubmit}
                  className="w-12 h-8 px-2 border rounded text-center bg-white"
                  aria-label="Número de página"
                />
              </div>
              <span className="text-sm">de {numPages || "--"}</span>
            </div>

            <button
              onClick={goToNextPage}
              disabled={!numPages || currentPage >= numPages || isLoading}
              className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              aria-label="Página siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2 mr-2">

            <button
              onClick={handleZoomOut}
              disabled={isLoading}
              className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              aria-label="Reducir zoom"
            >
              <ZoomOut className="h-5 w-5" />
            </button>

            <span className="text-sm font-medium w-16 text-center">{Math.round(scale * 100)}%</span>

            <button
              onClick={handleZoomIn}
              disabled={isLoading}
              className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              aria-label="Aumentar zoom"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      <div
        className="flex-1 overflow-auto p-4 flex justify-center items-center w-full"
        style={{ height: "calc(100vh - 200px)" }}
      >
        {error ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-500">
            <p>{error}</p>
            <button
              onClick={() => {
                setError(null)
                setIsLoading(true)
              }}
              className="mt-4 px-4 py-2 bg-gray-200 rounded"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <Document
            file={`data:application/pdf;base64,${pdf.data}`}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex justify-center items-center h-64">
                <Loader className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            }
          >
            <div
              className="relative inline-block"
            >
              {isLoading && (
                <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-80 z-10">
                  <Loader className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              )}
              <Page
                key={`page_${currentPage}`}
                pageNumber={currentPage}
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow"
                onLoadSuccess={onPageLoadSuccess}
                onLoadError={onPageLoadError}
              />
            </div>
          </Document>
        )}
      </div>
    </div>
  )
}

interface PdfsListProps {
  pdfs: PdfData[];
  onSelectPdf: (pdf: PdfData) => void;
  onDownloadPdf: (pdf: PdfData) => void;
}

export const PdfsList = ({ pdfs, onSelectPdf, onDownloadPdf }: PdfsListProps) => {
  return (
    <div className="rounded-md border my-4">
      <ul className="divide-y">
        {pdfs.map((pdf) => (
          <li key={pdf.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <DocumentIcon className="h-5 w-5 text-gray-600" />
              <span className="font-medium">{pdf.name}</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => onSelectPdf(pdf)}>
                <Eye className="h-4 w-4" />
                Ver
              </Button>
              <Button onClick={() => onDownloadPdf(pdf)}>
                <Download className="h-4 w-4" />
                Descargar
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

