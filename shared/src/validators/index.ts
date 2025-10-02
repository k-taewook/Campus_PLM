// 사용자 데이터 유효성 검증 스키마
export const userValidationSchema = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '올바른 이메일 주소를 입력해주세요.'
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    message: '이름은 2자 이상 50자 이하로 입력해주세요.'
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: '비밀번호는 8자 이상이며, 대소문자, 숫자, 특수문자를 포함해야 합니다.'
  }
};

// 프로젝트 데이터 유효성 검증 스키마
export const projectValidationSchema = {
  name: {
    required: true,
    minLength: 3,
    maxLength: 100,
    message: '프로젝트명은 3자 이상 100자 이하로 입력해주세요.'
  },
  description: {
    required: false,
    maxLength: 500,
    message: '설명은 500자 이하로 입력해주세요.'
  },
  startDate: {
    required: true,
    message: '시작일을 선택해주세요.'
  },
  endDate: {
    required: false,
    message: '종료일을 선택해주세요.'
  }
};

// 작업 데이터 유효성 검증 스키마
export const taskValidationSchema = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 200,
    message: '작업 제목은 3자 이상 200자 이하로 입력해주세요.'
  },
  description: {
    required: false,
    maxLength: 1000,
    message: '작업 설명은 1000자 이하로 입력해주세요.'
  },
  estimatedHours: {
    required: false,
    min: 0.5,
    max: 999,
    message: '예상 시간은 0.5시간 이상 999시간 이하로 입력해주세요.'
  }
};

// 유효성 검증 함수
export const validateField = (value: any, schema: any): { isValid: boolean; message?: string } => {
  if (schema.required && (!value || value.toString().trim() === '')) {
    return { isValid: false, message: schema.message || '필수 항목입니다.' };
  }

  if (value && schema.minLength && value.toString().length < schema.minLength) {
    return { isValid: false, message: schema.message || `최소 ${schema.minLength}자 이상 입력해주세요.` };
  }

  if (value && schema.maxLength && value.toString().length > schema.maxLength) {
    return { isValid: false, message: schema.message || `최대 ${schema.maxLength}자 이하로 입력해주세요.` };
  }

  if (value && schema.pattern && !schema.pattern.test(value.toString())) {
    return { isValid: false, message: schema.message || '올바른 형식이 아닙니다.' };
  }

  if (value && schema.min && parseFloat(value) < schema.min) {
    return { isValid: false, message: schema.message || `최소값은 ${schema.min}입니다.` };
  }

  if (value && schema.max && parseFloat(value) > schema.max) {
    return { isValid: false, message: schema.message || `최대값은 ${schema.max}입니다.` };
  }

  return { isValid: true };
};