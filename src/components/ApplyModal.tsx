import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { saveApplication, type ApplicationData } from '../utils/applicationStorage';
import './ApplyModal.css';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  vacancyId: string;
  vacancyTitle: string;
}

const ApplyModal: React.FC<ApplyModalProps> = ({
  isOpen,
  onClose,
  vacancyId,
  vacancyTitle
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    contact: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = t('apply.errors.nameRequired');
    }

    if (!formData.contact.trim()) {
      newErrors.contact = t('apply.errors.contactRequired');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;

      if (!emailRegex.test(formData.contact) && !phoneRegex.test(formData.contact)) {
        newErrors.contact = t('apply.errors.contactInvalid');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveApplicationToLocalStorage = (applicationData: ApplicationData) => {
    saveApplication(applicationData);
  };

  const simulateProgress = () => {
    return new Promise<void>((resolve) => {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.random() * 30;
        if (currentProgress >= 100) {
          currentProgress = 100;
          setProgress(100);
          clearInterval(interval);
          resolve();
        } else {
          setProgress(currentProgress);
        }
      }, 100);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setProgress(0);

    if (selectedFile) {
      await simulateProgress();
    }

    const applicationData: ApplicationData = {
      vacancyId,
      name: formData.name,
      contact: formData.contact,
      fileName: selectedFile?.name,
      date: new Date().toISOString()
    };

    saveApplicationToLocalStorage(applicationData);

    setIsSubmitting(false);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
      onClose();
      resetForm();
    }, 2000);
  };

  const resetForm = () => {
    setFormData({ name: '', contact: '' });
    setSelectedFile(null);
    setProgress(0);
    setErrors({});
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      resetForm();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
      } else {
        alert(t('apply.errors.fileType'));
        e.target.value = '';
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay apply-modal" onClick={handleClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{t('apply.title')}</h2>
            <button
              className="close-button"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              ×
            </button>
          </div>

          <div className="vacancy-info">
            <p><strong>{t('apply.vacancy')}:</strong> {vacancyTitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="apply-form">
            <div className="form-group">
              <label htmlFor="name">{t('apply.name')} *</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isSubmitting}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="contact">{t('apply.contact')} *</label>
              <input
                id="contact"
                type="text"
                placeholder={t('apply.contactPlaceholder')}
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                disabled={isSubmitting}
                className={errors.contact ? 'error' : ''}
              />
              {errors.contact && <span className="error-message">{errors.contact}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="resume">{t('apply.resume')}</label>
              <input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                disabled={isSubmitting}
              />
              {selectedFile && (
                <div className="file-info">
                  <span>{t('apply.selectedFile')}: {selectedFile.name}</span>
                </div>
              )}
            </div>

            {isSubmitting && selectedFile && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{Math.round(progress)}%</span>
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                onClick={handleClose}
                className="cancel-button"
                disabled={isSubmitting}
              >
                {t('apply.cancel')}
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? t('apply.sending') : t('apply.send')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showToast && (
        <div className="toast">
          <div className="toast-content">
            <span className="toast-icon">✓</span>
            <span className="toast-message">{t('apply.successMessage')}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default ApplyModal;