import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  FileType2,
  Presentation,
  Globe,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { extractTextFromFile, getFileTypeLabel, getAcceptedFileTypes } from '../utils/fileExtractor';
import { InputSource } from '../types';

interface FileUploadProps {
  onTextExtracted: (text: string, source: InputSource, fileName: string) => void;
  disabled: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onTextExtracted, disabled }) => {
  const [dragOver, setDragOver] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notionUrl, setNotionUrl] = useState('');
  const [showNotionInput, setShowNotionInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'text' | 'notion'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setIsExtracting(true);
    setUploadedFile(file.name);

    try {
      const text = await extractTextFromFile(file);
      if (text.trim().length < 50) {
        throw new Error('Extracted text is too short. The document may be image-based or empty.');
      }

      const ext = file.name.split('.').pop()?.toLowerCase();
      let source: InputSource = 'text';
      if (ext === 'pdf') source = 'pdf';
      else if (ext === 'docx' || ext === 'doc') source = 'docx';
      else if (ext === 'pptx' || ext === 'ppt') source = 'pptx';

      onTextExtracted(text, source, file.name);
    } catch (err: any) {
      setError(err.message || 'Failed to extract text from file.');
      setUploadedFile(null);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleTextSubmit = () => {
    if (textInput.trim().length < 50) {
      setError('Please paste at least 50 characters of text.');
      return;
    }
    onTextExtracted(textInput, 'text', 'Pasted text');
  };

  const handleNotionSubmit = () => {
    if (!notionUrl.trim()) {
      setError('Please enter a Notion page URL.');
      return;
    }
    // We'll handle Notion via MCP in the parent
    onTextExtracted(`NOTION_URL:${notionUrl}`, 'notion', 'Notion page');
  };

  const tabs = [
    { id: 'upload' as const, label: 'Upload File', icon: Upload },
    { id: 'text' as const, label: 'Paste Text', icon: FileText },
    { id: 'notion' as const, label: 'Notion Link', icon: Globe },
  ];

  const fileTypes = [
    { icon: FileText, label: 'PDF', color: 'text-red-500' },
    { icon: FileType2, label: 'Word / DOCX', color: 'text-blue-500' },
    { icon: Presentation, label: 'PowerPoint', color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-4">
      {/* Tab Buttons */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setError(null); }}
            disabled={disabled}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-white text-blood-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            dragOver
              ? 'border-blood-500 bg-blood-50'
              : uploadedFile
                ? 'border-green-300 bg-green-50'
                : 'border-gray-200 bg-gray-50 hover:border-blood-300 hover:bg-blood-50/30'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={getAcceptedFileTypes()}
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />

          {isExtracting ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="text-blood-600 animate-spin" />
              <p className="text-sm font-semibold text-gray-600">Extracting text from {uploadedFile}...</p>
            </div>
          ) : uploadedFile ? (
            <div className="flex flex-col items-center gap-3">
              <CheckCircle2 size={32} className="text-green-500" />
              <div>
                <p className="text-sm font-semibold text-green-700">{uploadedFile}</p>
                <p className="text-xs text-green-600 mt-1">Text extracted successfully</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 bg-blood-100 rounded-2xl flex items-center justify-center">
                <Upload size={24} className="text-blood-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Drop your file here or click to browse
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supports PDF, Word, PowerPoint, and text files
                </p>
              </div>
              <div className="flex gap-4 mt-2">
                {fileTypes.map(ft => (
                  <div key={ft.label} className="flex items-center gap-1.5 text-xs text-gray-400">
                    <ft.icon size={14} className={ft.color} />
                    {ft.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Text Tab */}
      {activeTab === 'text' && (
        <div className="space-y-3">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            disabled={disabled}
            placeholder="Paste your medical content, lecture notes, guideline text, or any haematology content here..."
            className="w-full h-56 p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blood-100 focus:border-blood-500 transition-all resize-none text-sm leading-relaxed text-gray-700 outline-none"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400 font-mono">{textInput.length} chars</span>
            <button
              onClick={handleTextSubmit}
              disabled={disabled || textInput.trim().length < 50}
              className="px-4 py-2 bg-blood-600 text-white rounded-lg text-sm font-semibold hover:bg-blood-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Use This Text
            </button>
          </div>
        </div>
      )}

      {/* Notion Tab */}
      {activeTab === 'notion' && (
        <div className="space-y-3">
          <div className="bg-venous-50 rounded-xl p-4 flex items-start gap-3">
            <Globe size={18} className="text-venous-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-venous-600">Notion Integration</p>
              <p className="text-xs text-gray-500 mt-1">
                Paste a Notion page URL. Content will be extracted via MCP integration.
              </p>
            </div>
          </div>
          <input
            type="url"
            value={notionUrl}
            onChange={(e) => setNotionUrl(e.target.value)}
            disabled={disabled}
            placeholder="https://www.notion.so/your-page-id..."
            className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-venous-100 focus:border-venous-600 transition-all text-sm text-gray-700 outline-none"
          />
          <button
            onClick={handleNotionSubmit}
            disabled={disabled || !notionUrl.trim()}
            className="w-full px-4 py-3 bg-venous-600 text-white rounded-xl text-sm font-semibold hover:bg-venous-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Extract from Notion
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-medium text-red-700">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
