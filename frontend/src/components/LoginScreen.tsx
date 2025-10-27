import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginScreen() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            PLM System
          </h1>
          <p className="text-gray-600">
            프로젝트 생명주기 관리 시스템에 오신 것을 환영합니다
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">로그인</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                이메일
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <Mail style={{ width: '20px', height: '20px', color: '#9ca3af' }} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    paddingLeft: '44px',
                    paddingRight: '16px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  placeholder="user@example.com"
                  disabled={isLoading}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                비밀번호
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <Lock style={{ width: '20px', height: '20px', color: '#9ca3af' }} />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    paddingLeft: '44px',
                    paddingRight: '16px',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  placeholder="••••••••"
                  disabled={isLoading}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                backgroundColor: '#2563eb',
                color: 'white',
                fontWeight: '600',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: isLoading ? 0.5 : 1,
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#1d4ed8')}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid white',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span>로그인 중...</span>
                </>
              ) : (
                <>
                  <LogIn style={{ width: '20px', height: '20px' }} />
                  <span>로그인</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 mb-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">또는</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{' '}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                회원가입
              </Link>
            </p>
          </div>

          {/* Test Account Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-2">테스트 계정:</p>
            <div className="text-xs text-gray-600 space-y-1">
              <p>이메일: admin@plm.com</p>
              <p>비밀번호: admin1234</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          © 2025 PLM System. All rights reserved.
        </p>
      </div>
    </div>
  );
}
