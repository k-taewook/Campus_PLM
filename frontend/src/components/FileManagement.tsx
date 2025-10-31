import { useState, useEffect } from 'react';
import { Paperclip, Upload as UploadIcon } from 'lucide-react';
import FileUploadZone from './FileUploadZone';
import FileList, { FileItem } from './FileList';
import api from '../services/api';

interface FileManagementProps {
  projectId?: number;
  taskId?: number;
  uploaderId: number;
  title?: string;
}

export default function FileManagement({ 
  projectId, 
  taskId, 
  uploaderId,
  title = '첨부파일'
}: FileManagementProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 파일 목록 불러오기
  useEffect(() => {
    loadFiles();
  }, [projectId, taskId]);

  const loadFiles = async () => {
    try {
      let response;
      if (projectId) {
        response = await api.get(`/api/files/project/${projectId}`);
      } else if (taskId) {
        response = await api.get(`/api/files/task/${taskId}`);
      } else {
        return;
      }
      setFiles(response.data);
    } catch (err: any) {
      console.error('파일 목록 로드 실패:', err);
      setError('파일 목록을 불러올 수 없습니다.');
    }
  };

  // 파일 업로드
  const handleUpload = async (fileList: FileList) => {
    setIsUploading(true);
    setError(null);

    try {
      const uploadPromises = Array.from(fileList).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('uploaderId', uploaderId.toString());
        
        if (projectId) {
          formData.append('projectId', projectId.toString());
        }
        if (taskId) {
          formData.append('taskId', taskId.toString());
        }

        return api.post('/api/files/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      });

      await Promise.all(uploadPromises);
      
      // 업로드 성공 후 목록 새로고침
      await loadFiles();
      setShowUploadZone(false);
      
      alert(`${fileList.length}개 파일이 업로드되었습니다.`);
    } catch (err: any) {
      console.error('파일 업로드 실패:', err);
      setError('파일 업로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsUploading(false);
    }
  };

  // 파일 다운로드
  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      const response = await api.get(`/api/files/${fileId}/download`, {
        responseType: 'blob',
      });

      // Blob을 다운로드 링크로 변환
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // 다운로드 후 목록 새로고침 (다운로드 횟수 업데이트)
      await loadFiles();
    } catch (err: any) {
      console.error('파일 다운로드 실패:', err);
      alert('파일 다운로드에 실패했습니다.');
    }
  };

  // 파일 삭제
  const handleDelete = async (fileId: number) => {
    try {
      await api.delete(`/api/files/${fileId}`);
      
      // 삭제 후 목록 새로고침
      await loadFiles();
      
      alert('파일이 삭제되었습니다.');
    } catch (err: any) {
      console.error('파일 삭제 실패:', err);
      alert('파일 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            {title} ({files.length})
          </h3>
        </div>
        
        {!showUploadZone && (
          <button
            onClick={() => setShowUploadZone(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            <UploadIcon className="w-4 h-4" />
            <span>파일 업로드</span>
          </button>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* 업로드 영역 */}
      {showUploadZone && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <FileUploadZone 
            onUpload={handleUpload}
            maxSize={10}
            multiple={true}
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setShowUploadZone(false)}
              disabled={isUploading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              취소
            </button>
          </div>
          
          {isUploading && (
            <div className="mt-4 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">업로드 중...</p>
            </div>
          )}
        </div>
      )}

      {/* 파일 목록 */}
      <FileList 
        files={files}
        onDownload={handleDownload}
        onDelete={handleDelete}
      />
    </div>
  );
}
