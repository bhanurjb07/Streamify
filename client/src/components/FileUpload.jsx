import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "../config/constants";

export default function FileUpload({ onFileSelect, onError }) {
  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      onError?.("Only images (jpg, png, gif, webp) and PDF files are allowed");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      onError?.("File size must be 5MB or less");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onFileSelect({
        name: file.name,
        mimeType: file.type,
        size: file.size,
        data: reader.result,
      });
    };
    reader.onerror = () => {
      onError?.("Failed to read file");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <label className="flex cursor-pointer items-center justify-center rounded-xl border border-slate-600 bg-slate-800 p-2.5 text-slate-400 transition hover:border-indigo-500 hover:text-indigo-400">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
      </svg>
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,image/jpeg,image/png,image/gif,image/webp,application/pdf"
        onChange={handleChange}
        className="sr-only"
      />
    </label>
  );
}
