export interface PdfSignerProps {
  onPdfClick: ({ x, y, page }: {
    x: number
    y: number
    page: number
  }) => void;
  className?: string
  modalClassName?: string;
  children?: React.ReactNode
}