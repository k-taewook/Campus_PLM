import { useEffect, useState } from 'react';
import api from '../services/api';

interface Project {
  id: number;
  projectKey: string;
  name: string;
  description: string;
  status: string;
  managerId: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      console.log('프로젝트 로드 시작...');
      const response = await api.get('/projects');
      console.log('프로젝트 로드 성공:', response.data);
      setProjects(response.data);
      setError(null);
    } catch (err: any) {
      console.error('프로젝트 로드 실패:', err);
      console.error('에러 상세:', err.response);
      const errorMsg = err.response?.data?.message || err.message || '프로젝트를 불러올 수 없습니다.';
      setError(`에러: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 text-lg mb-2">프로젝트를 불러올 수 없습니다</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={loadProjects}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full"
            >
              다시 시도
            </button>
            <p className="text-xs text-gray-500">
              브라우저 콘솔(F12)을 확인하세요
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">프로젝트 목록</h1>
          <p className="text-gray-600 mt-2">총 {projects.length}개의 프로젝트</p>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">프로젝트가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {project.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    project.status === 'PLANNING' ? 'bg-blue-100 text-blue-800' :
                    project.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {project.status}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {project.description || '설명 없음'}
                </p>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>시작일: {new Date(project.startDate).toLocaleDateString()}</p>
                  <p>종료일: {new Date(project.endDate).toLocaleDateString()}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    상세 보기 →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
