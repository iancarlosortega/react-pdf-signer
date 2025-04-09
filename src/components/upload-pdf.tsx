import { useRef } from "react";
import { Upload } from "../icons/Upload";
import { cn } from "../utils/cn";

interface UploadPDFProps {
  onFileChange: (file: File) => void;
  children?: React.ReactNode;
  className?: string;
}

export const UploadPDF = ({ onFileChange, className, children }: UploadPDFProps) => {

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      onFileChange(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

   return (
    <div>
      <input
        type='file'
        ref={fileInputRef}
        onChange={handleFileChange}
        accept='.pdf'
        className='hidden'
        data-testid='pdf-upload'
      />
      <button onClick={handleButtonClick} className={
        cn(
          "border bg-white text-black hover:bg-gray-50 transition-colors rounded-md px-4 py-2 flex items-center gap-2",
          className,
        )
      }>
        {
          children ? children : <><Upload className='size-4'/> Firmar PDF</>
        }
      </button>
    </div>
  );
}
