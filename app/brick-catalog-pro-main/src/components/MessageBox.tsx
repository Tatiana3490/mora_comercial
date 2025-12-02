import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBoxProps {
  message: string;
  onClose: () => void;
  type?: 'success' | 'error';
}

export const MessageBox = ({ message, onClose, type = 'success' }: MessageBoxProps) => {
  if (!message) return null;
  
  return (
    <div className={cn(
      "fixed top-5 right-5 p-4 border rounded-lg shadow-elegant z-50 animate-fade-in",
      type === 'success' ? "bg-green-100 border-green-400 text-green-700" : "bg-red-100 border-red-400 text-red-700"
    )}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 font-bold hover:opacity-70 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
