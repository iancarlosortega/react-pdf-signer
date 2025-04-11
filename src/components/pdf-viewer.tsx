import { useEffect, useRef, useState } from "react"
import { Document, Page } from "react-pdf"
import { ChevronLeft } from "../icons/ChevronLeft";
import { ChevronRight } from "../icons/ChevronRight";
import { ZoomOut } from "../icons/ZoomOut";
import { ZoomIn } from "../icons/ZoomIn";
import { Loader } from "../icons/Loader";
import { Button } from "./button";
import { Check } from "../icons/Check";
import { Close } from "../icons/Close";
import { Pen } from "../icons/Pen";
import { Trash } from "../icons/Trash";
import { Minus } from "../icons/Minus";

interface PdfViewerProps {
  pdfUrl: string
  onPdfClick: (x: number, y: number, page: number) => void
}

export const PdfViewer = ({ pdfUrl, onPdfClick }: PdfViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageInputValue, setPageInputValue] = useState<string>("1")
  const [scale, setScale] = useState<number>(1.0)
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<{ x: number; y: number } | null>(null)
  const [signedPosition, setSignedPosition] = useState<{ x: number; y: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageSize, setPageSize] = useState<{ width: number; height: number } | null>(null)
  const pageInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Reset loading state when changing pages
  useEffect(() => {
    setIsLoading(true)
    setError(null)
    setPageInputValue(currentPage.toString())
  }, [currentPage])

  // Center the view when zooming
  useEffect(() => {
    if (containerRef.current && pageSize) {
      // Reset scroll position to center when zoom changes
      const container = containerRef.current
      const scaledWidth = pageSize.width * scale
      const scaledHeight = pageSize.height * scale

      // Only center if the content is larger than the container
      if (scaledWidth > container.clientWidth || scaledHeight > container.clientHeight) {
        container.scrollLeft = (scaledWidth - container.clientWidth) / 2
        container.scrollTop = (scaledHeight - container.clientHeight) / 2
      }
    }
  }, [scale, pageSize])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setIsLoading(false)
  }

  const onDocumentLoadError = (error: Error) => {
    console.error("Error loading PDF:", error)
    setError("Error al cargar el PDF. Por favor, inténtelo de nuevo.")
    setIsLoading(false)
  }

  const onPageLoadSuccess = ({ width, height }: { width: number; height: number }) => {
    setPageSize({ width, height })
    setIsLoading(false)
  }

  const onPageLoadError = (error: Error) => {
    console.error("Error loading page:", error)
    setError(`Error al cargar la página ${currentPage}. Por favor, inténtelo de nuevo.`)
    setIsLoading(false)
  }

  const handleConfirmSignature = () => {
    if (!signedPosition) return

    const scaledPosition = {
      x: signedPosition.x / scale,
      y: signedPosition.y / scale,
    }

    console.log({
      signedPosition,
      scaledPosition,
      currentPage,
      scale,
    })

    onPdfClick(scaledPosition.x, scaledPosition.y, currentPage)
  }

  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {

    if (selectedPosition || signedPosition) return

    const pageDiv = e.currentTarget
    const rect = pageDiv.getBoundingClientRect()

    // Calculate coordinates relative to the PDF page
    const x = (e.clientX - rect.left)
    const y = (e.clientY - rect.top)

    setSelectedPosition({
      x: x,
      y: y,
    })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const pageDiv = e.currentTarget
    const rect = pageDiv.getBoundingClientRect()

    setHoverPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseLeave = () => {
    setHoverPosition(null)
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

  // Confirm signature position
  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the container click
    if (selectedPosition) {
      console.log("Signature position confirmed:", selectedPosition)
      setSignedPosition(selectedPosition)
      setSelectedPosition(null) // Clear selection
    }
  }

  // Cancel/delete signature position selection
  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the container click
    setSelectedPosition(null)
  }

  // Remove existing signature
  const handleRemoveSignature = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the container click
    setSignedPosition(null)
  }

  return (
    <div className="pdf-viewer flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b bg-gray-50">

        {
          signedPosition ? (
            <div className="flex items-center gap-x-2 justify-end w-full">
              <Button onClick={handleRemoveSignature}>
                <Trash className="h-4 w-4 mr-1" />
                Eliminar firma
              </Button>

              <Button onClick={handleConfirmSignature}>
                <Check className="h-4 w-4 mr-1" />
                Confirmar firma
              </Button>
            </div>
          ) : (
            <>
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

              <div className="flex items-center space-x-2">

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
            </>
          )
        }
      </div>

      <div
        ref={containerRef}
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
            file={pdfUrl}
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
              onClick={handlePageClick}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
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

              {!isLoading && (
                <>
                  {!selectedPosition && !signedPosition && hoverPosition && (
                    <div
                      className="absolute border-2 border-blue-500 bg-blue-100/30 pointer-events-none"
                      style={{
                        left: hoverPosition.x - 50,
                        top: hoverPosition.y - 25,
                        width: "100px",
                        height: "50px",
                        zIndex: 10,
                      }}
                    />
                  )}

                  {/* Selected position with confirm/cancel buttons */}
                  {selectedPosition && (
                    <div
                      className="absolute border-2 border-green-500 bg-green-100/30"
                      style={{
                        left: selectedPosition.x - 50,
                        top: selectedPosition.y - 25,
                        width: "100px",
                        height: "50px",
                        zIndex: 20,
                      }}
                    >
                      <div className="absolute -top-12 left-0 flex space-x-2 z-30">
                        <Button className="h-8 text-xs" onClick={handleConfirm}>
                          <Check className="h-4 w-4 mr-1" />Confirmar
                        </Button>
                        <Button className="h-8 bg-white" onClick={handleCancel}>
                          <Close className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {signedPosition && (
                    <div
                      className="absolute border-2 border-green-500 bg-green-100/30 cursor-pointer"
                      style={{
                        left: signedPosition.x - 50,
                        top: signedPosition.y - 25,
                        width: "100px",
                        height: "50px",
                        zIndex: 15,
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex items-center space-x-1 text-green-700 font-medium">
                          <Pen className="h-3 w-3" />
                          <span>Firmado</span>
                        </div>
                      </div>
                      <Button className="absolute border-gray-400 rounded-full -right-3 -top-3 h-6 w-6 p-0" onClick={handleRemoveSignature} aria-label="Close modal">
                        <Minus className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </Document>
        )}
      </div>
    </div>
  )
}