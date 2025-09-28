import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

interface ModalAuthProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'login' | 'register';
  onAuthSuccess: (user: any) => void;
}

interface FormData {
  name?: string;
  email: string;
  password: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

const ModalAuth = ({ isOpen, onClose, type, onAuthSuccess }: ModalAuthProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedUser, setConfirmedUser] = useState<any>(null);

  if (!isOpen) return null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (type === 'register') {
      if (!formData.name?.trim()) {
        newErrors.name = 'Имя обязательно';
      }
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Неверный формат email';
    }

    if (!formData.password?.trim()) {
      newErrors.password = 'Пароль обязателен';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userData = {
      id: userId,
      name: type === 'register' ? formData.name : formData.email.split('@')[0],
      email: formData.email,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('edu_user', JSON.stringify(userData));

    setConfirmedUser(userData);
    setShowConfirmation(true);

    setTimeout(() => {
      setShowConfirmation(false);
      onAuthSuccess(userData);
      onClose();
      navigate('/my-courses');
    }, 2000);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (showConfirmation && confirmedUser) {
    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-content">
            <div className="confirmation-message">
              <h2>Вы вошли как {confirmedUser.name}</h2>
              <p>Перенаправление на страницу курсов...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{type === 'login' ? t('header.login') : t('header.register')}</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="modal-content">
          <form onSubmit={handleSubmit} className="auth-form">
            {type === 'register' && (
              <div className="form-group">
                <label htmlFor="name">Имя</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <button type="submit" className="auth-submit-btn">
              {type === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalAuth;