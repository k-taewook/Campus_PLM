import { useAuth } from '../contexts/AuthContext';
import FileManagement from '../components/FileManagement';

export default function FileManagementDemo() {
  const { user } = useAuth();

  // 테스트용 프로젝트 ID (실제로는 라우터 파라미터나 선택된 프로젝트에서 가져옴)
  const testProjectId = 1;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>로그인이 필요합니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">파일 관리 시스템</h1>
          <p className="text-gray-600 mt-2">
            프로젝트 또는 태스크에 파일을 업로드하고 관리할 수 있습니다.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <FileManagement 
            projectId={testProjectId}
            uploaderId={user.id}
            title="프로젝트 첨부파일"
          />
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">사용 방법</h2>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• <strong>업로드:</strong> "파일 업로드" 버튼을 클릭하거나 파일을 드래그 앤 드롭하세요.</li>
            <li>• <strong>다운로드:</strong> 파일 목록에서 초록색 다운로드 버튼을 클릭하세요.</li>
            <li>• <strong>미리보기:</strong> 이미지 파일은 눈 아이콘을 클릭하면 새 탭에서 열립니다.</li>
            <li>• <strong>삭제:</strong> 빨간색 휴지통 버튼을 클릭하면 파일을 삭제할 수 있습니다.</li>
            <li>• <strong>제한:</strong> 최대 파일 크기는 10MB입니다.</li>
          </ul>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">기술 스택</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Backend</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• Spring Boot 3.2.3</li>
                <li>• FileService & FileController</li>
                <li>• Multipart File Upload (10MB)</li>
                <li>• Local Storage (./uploads)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Frontend</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• React 18.3.1 + TypeScript</li>
                <li>• FileUploadZone (Drag & Drop)</li>
                <li>• FileList (Display & Actions)</li>
                <li>• Axios for API calls</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
