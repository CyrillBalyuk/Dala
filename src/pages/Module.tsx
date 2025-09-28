import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useTranslation } from '../hooks/useTranslation';
import { runHtmlGrader, runConsoleGrader } from '../utils/grader';
import assignments from '../data/assignments.json';
import modules from '../data/modules.json';
import './Module.css';

interface Assignment {
  id: string;
  moduleId: string;
  title: { ru: string; kz: string };
  description: { ru: string; kz: string };
  files: Array<{ path: string; content: string }>;
  expectedOutputType: string;
  expectedOutput: string;
  hint: { ru: string; kz: string };
}

interface ModuleData {
  id: string;
  courseId: string;
  title: { ru: string; kz: string };
  assignments: string[];
}

const ModulePage = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation();

  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(null);
  const [completedAssignments, setCompletedAssignments] = useState<Set<string>>(new Set());
  const [currentFiles, setCurrentFiles] = useState<Array<{ path: string; content: string }>>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Get module and assignments data
  const moduleData = modules.find((m: ModuleData) => m.id === moduleId);
  const moduleAssignments = assignments.filter((a: Assignment) => a.moduleId === moduleId);

  // Load completed assignments from localStorage
  useEffect(() => {
    const completed = localStorage.getItem(`completed_assignments_${courseId}_${moduleId}`);
    if (completed) {
      setCompletedAssignments(new Set(JSON.parse(completed)));
    }
  }, [courseId, moduleId]);

  // Set first assignment as current on load
  useEffect(() => {
    if (moduleAssignments.length > 0 && !currentAssignment) {
      setCurrentAssignment(moduleAssignments[0]);
    }
  }, [moduleAssignments, currentAssignment]);

  // Update files when assignment changes
  useEffect(() => {
    if (currentAssignment) {
      setCurrentFiles([...currentAssignment.files]);
      setActiveFileIndex(0);
      setStatusMessage(null);
    }
  }, [currentAssignment]);

  // Get Monaco language from file extension
  const getMonacoLanguage = (filename: string) => {
    if (filename.endsWith('.html')) return 'html';
    if (filename.endsWith('.css')) return 'css';
    if (filename.endsWith('.js')) return 'javascript';
    return 'html'; // default
  };

  // Handle editor content change
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCurrentFiles(prev => {
        const newFiles = [...prev];
        newFiles[activeFileIndex] = { ...newFiles[activeFileIndex], content: value };
        return newFiles;
      });
    }
  };

  // Update iframe preview with proper HTML/CSS/JS execution
  useEffect(() => {
    if (iframeRef.current && currentFiles.length > 0) {
      const htmlFile = currentFiles.find(file => file.path.endsWith('.html'));
      const cssFile = currentFiles.find(file => file.path.endsWith('.css'));
      const jsFile = currentFiles.find(file => file.path.endsWith('.js'));

      if (htmlFile) {
        let htmlContent = htmlFile.content;

        // Ensure UTF-8 charset is present for preview
        if (!htmlContent.includes('charset')) {
          if (htmlContent.includes('<head>')) {
            htmlContent = htmlContent.replace('<head>', '<head>\n    <meta charset="UTF-8">');
          } else if (htmlContent.includes('<html>')) {
            htmlContent = htmlContent.replace('<html>', '<html>\n<head>\n    <meta charset="UTF-8">\n</head>');
          } else {
            htmlContent = `<head>\n    <meta charset="UTF-8">\n</head>\n${htmlContent}`;
          }
        }

        // Inject CSS if exists
        if (cssFile && cssFile.content.trim()) {
          const cssTag = `<style>${cssFile.content}</style>`;
          if (htmlContent.includes('</head>')) {
            htmlContent = htmlContent.replace('</head>', `${cssTag}\n</head>`);
          } else if (htmlContent.includes('<head>')) {
            htmlContent = htmlContent.replace('<head>', `<head>\n${cssTag}`);
          } else {
            htmlContent = `<head>\n${cssTag}\n</head>${htmlContent}`;
          }
        }

        // Inject JS if exists
        if (jsFile && jsFile.content.trim()) {
          const jsTag = `<script>${jsFile.content}</script>`;
          if (htmlContent.includes('</body>')) {
            htmlContent = htmlContent.replace('</body>', `${jsTag}\n</body>`);
          } else {
            htmlContent += `\n${jsTag}`;
          }
        }

        const blob = new Blob([htmlContent], { type: 'text/html; charset=utf-8' });
        const url = URL.createObjectURL(blob);
        iframeRef.current.src = url;

        return () => {
          URL.revokeObjectURL(url);
        };
      }
    }
  }, [currentFiles]);

  const handleAssignmentClick = (assignment: Assignment) => {
    setCurrentAssignment(assignment);
  };

  const handleFileTabClick = (index: number) => {
    setActiveFileIndex(index);
  };

  const handleHintClick = () => {
    setShowHint(true);
  };

  const goBackToCourse = () => {
    navigate(`/course/${courseId}`);
  };

  const checkAssignment = async (): Promise<{ ok: boolean; message: string; details?: { expected: string; actual: string } } | null> => {
    if (!currentAssignment) return null;

    try {
      if (currentAssignment.expectedOutputType === 'console') {
        // For console output, we need to capture console logs
        // For now, return a placeholder - this would need proper console capturing
        const result = runConsoleGrader('', currentAssignment.expectedOutput);
        return result;
      } else {
        // HTML output - execute code in iframe and get result
        const htmlFile = currentFiles.find(file => file.path.endsWith('.html'));
        if (!htmlFile || !currentAssignment.expectedOutput) {
          return {
            ok: false,
            message: t('module.checkingError')
          };
        }

        // Create a temporary iframe to execute and check the result
        const tempIframe = document.createElement('iframe');
        tempIframe.style.display = 'none';
        // Use allow-same-origin to access iframe content
        tempIframe.sandbox = 'allow-scripts allow-same-origin';
        document.body.appendChild(tempIframe);

        try {
          // Prepare HTML content with proper UTF-8 encoding
          const cssFile = currentFiles.find(file => file.path.endsWith('.css'));
          const jsFile = currentFiles.find(file => file.path.endsWith('.js'));
          let htmlContent = htmlFile.content;

          // Ensure proper HTML structure with UTF-8 encoding
          if (!htmlContent.includes('<html')) {
            htmlContent = `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n</head>\n<body>\n${htmlContent}\n</body>\n</html>`;
          } else if (!htmlContent.includes('charset')) {
            htmlContent = htmlContent.replace('<head>', '<head>\n<meta charset="UTF-8">');
          }

          if (cssFile && cssFile.content.trim()) {
            const cssTag = `<style>${cssFile.content}</style>`;
            if (htmlContent.includes('</head>')) {
              htmlContent = htmlContent.replace('</head>', `${cssTag}\n</head>`);
            } else if (htmlContent.includes('<head>')) {
              htmlContent = htmlContent.replace('<head>', `<head>\n${cssTag}`);
            } else {
              htmlContent = `<head>\n${cssTag}\n</head>${htmlContent}`;
            }
          }

          if (jsFile && jsFile.content.trim()) {
            const jsTag = `<script>${jsFile.content}</script>`;
            if (htmlContent.includes('</body>')) {
              htmlContent = htmlContent.replace('</body>', `${jsTag}\n</body>`);
            } else {
              htmlContent += `\n${jsTag}`;
            }
          }

          // Use srcdoc instead of blob URL to avoid cross-origin issues
          tempIframe.srcdoc = htmlContent;

          // Wait for iframe to load and check result
          return await new Promise((resolve) => {
            const timeout = setTimeout(() => {
              resolve({
                ok: false,
                message: t('module.loadingTimeout')
              });
            }, 3000);

            tempIframe.onload = () => {
              clearTimeout(timeout);
              try {
                // Wait a bit more for JavaScript to execute
                setTimeout(() => {
                  try {
                    const iframeDoc = tempIframe.contentDocument || tempIframe.contentWindow?.document;

                    if (!iframeDoc) {
                      resolve({
                        ok: false,
                        message: t('module.iframeAccessError')
                      });
                      return;
                    }

                    // Get the body innerHTML for grading
                    const actualOutput = iframeDoc.body?.innerHTML || '';
                    const result = runHtmlGrader(actualOutput, currentAssignment.expectedOutput);
                    resolve(result);
                  } catch (error) {
                    resolve({
                      ok: false,
                      message: t('module.incorrectAnswer')
                    });
                  }
                }, 100);
              } catch (error) {
                resolve({
                  ok: false,
                  message: t('module.incorrectAnswer')
                });
              }
            };

            tempIframe.onerror = () => {
              clearTimeout(timeout);
              resolve({
                ok: false,
                message: t('module.iframeLoadError')
              });
            };
          });
        } finally {
          if (document.body.contains(tempIframe)) {
            document.body.removeChild(tempIframe);
          }
        }
      }
    } catch (error) {
      return {
        ok: false,
        message: t('module.incorrectAnswer')
      };
    }
  };

  const handleCheckClick = async () => {
    const result = await checkAssignment();
    if (!result) return;

    setStatusMessage({
      type: result.ok ? 'success' : 'error',
      text: result.message
    });
  };

  const handleNextClick = async () => {
    if (!currentAssignment) return;

    const result = await checkAssignment();
    if (!result) return;

    if (result.ok) {
      // Mark as completed and update localStorage.edu_progress
      const newCompleted = new Set(completedAssignments);
      newCompleted.add(currentAssignment.id);
      setCompletedAssignments(newCompleted);

      // Update localStorage.edu_progress according to TZ specification
      const progressKey = 'edu_progress';
      const existingProgress = JSON.parse(localStorage.getItem(progressKey) || '{}');

      if (!existingProgress[courseId!]) {
        existingProgress[courseId!] = {};
      }
      if (!existingProgress[courseId!][moduleId!]) {
        existingProgress[courseId!][moduleId!] = {};
      }

      existingProgress[courseId!][moduleId!][currentAssignment.id] = true;
      localStorage.setItem(progressKey, JSON.stringify(existingProgress));

      // Keep the old format for backwards compatibility
      localStorage.setItem(
        `completed_assignments_${courseId}_${moduleId}`,
        JSON.stringify([...newCompleted])
      );

      setStatusMessage({
        type: 'success',
        text: t('module.assignmentCompleted')
      });

      // Navigation logic according to TZ
      const currentIndex = moduleAssignments.findIndex(a => a.id === currentAssignment.id);
      if (currentIndex < moduleAssignments.length - 1) {
        // Next assignment in current module
        setTimeout(() => {
          setCurrentAssignment(moduleAssignments[currentIndex + 1]);
        }, 1500);
      } else {
        // Last assignment in module - should go to next module or back to courses
        const allModules = modules.filter((m: ModuleData) => m.courseId === courseId);
        const currentModuleIndex = allModules.findIndex(m => m.id === moduleId);

        if (currentModuleIndex < allModules.length - 1) {
          // Go to first assignment of next module
          const nextModule = allModules[currentModuleIndex + 1];
          const nextModuleAssignments = assignments.filter((a: Assignment) => a.moduleId === nextModule.id);
          if (nextModuleAssignments.length > 0) {
            setTimeout(() => {
              window.location.href = `/course/${courseId}/module/${nextModule.id}`;
            }, 2000);
          }
        } else {
          // Last module - go back to "My Courses"
          setTimeout(() => {
            window.location.href = '/my-courses';
          }, 2000);
        }
      }
    } else {
      setStatusMessage({
        type: 'error',
        text: result.message
      });
    }
  };

  if (!moduleData || moduleAssignments.length === 0) {
    return (
      <div className="module-page">
        <div className="container">
          <h1>{t('module.notFound')}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="module-page">
      {/* Part 1: Assignments List + Assignment Description (4.1) */}
      <div className="module-part assignments-and-description">
        <div className="assignments-section">
          <div className="module-header">
            <button className="back-button" onClick={goBackToCourse} title="Назад к курсу">
              <img src="/assets/logo.svg" alt="Logo" className="back-logo" />
            </button>
            <h2 className="module-title">{moduleData.title[currentLanguage as keyof typeof moduleData.title]}</h2>
          </div>
          <ul className="assignments-list">
            {moduleAssignments.map((assignment) => (
              <li
                key={assignment.id}
                className={`assignment-item ${
                  currentAssignment?.id === assignment.id ? 'active' : ''
                } ${
                  completedAssignments.has(assignment.id) ? 'completed' : ''
                }`}
                onClick={() => handleAssignmentClick(assignment)}
              >
                {assignment.title[currentLanguage as keyof typeof assignment.title]}
              </li>
            ))}
          </ul>
        </div>

        <div className="assignment-description-section">
          {currentAssignment && (
            <div
              className="assignment-description"
              dangerouslySetInnerHTML={{
                __html: currentAssignment.description[currentLanguage as keyof typeof currentAssignment.description]
              }}
            />
          )}
        </div>
      </div>

      {/* Part 2: Code Editor with File Tabs (4.2) */}
      <div className="module-part editor-part">
        {/* File Tabs */}
        <div className="file-tabs">
          {currentFiles.map((file, index) => (
            <div
              key={index}
              className={`file-tab ${index === activeFileIndex ? 'active' : ''}`}
              onClick={() => handleFileTabClick(index)}
            >
              {file.path}
            </div>
          ))}
        </div>

        {/* Monaco Editor */}
        <div className="code-editor">
          {currentFiles.length > 0 && (
            <Editor
              height="100%"
              language={getMonacoLanguage(currentFiles[activeFileIndex]?.path || '')}
              value={currentFiles[activeFileIndex]?.content || ''}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true
              }}
            />
          )}
        </div>
      </div>

      {/* Part 3: Code Output + Buttons (4.3) */}
      <div className="module-part output-part">
        {/* Preview Area */}
        <div className="preview-area">
          <iframe
            ref={iframeRef}
            className="preview-iframe"
            sandbox="allow-scripts"
            title="Preview"
          />
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className={`status-message ${statusMessage.type}`}>
            {statusMessage.text}
          </div>
        )}

        {/* Buttons at bottom */}
        <div className="editor-buttons">
          <button className="hint-button" onClick={handleHintClick}>
            {t('module.hintFromAI')}
          </button>
          <button className="check-button" onClick={handleCheckClick}>
            {t('module.check')}
          </button>
          <button className="next-button" onClick={handleNextClick}>
            {t('module.next')}
          </button>
        </div>
      </div>

      {/* Hint Modal */}
      {showHint && currentAssignment && (
        <div className="hint-modal" onClick={() => setShowHint(false)}>
          <div className="hint-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="hint-modal-header">
              <h3 className="hint-modal-title">
                {t('module.hint')}
              </h3>
              <button
                className="hint-modal-close"
                onClick={() => setShowHint(false)}
              >
                ×
              </button>
            </div>
            <div
              className="hint-content"
              dangerouslySetInnerHTML={{
                __html: currentAssignment.hint[currentLanguage as keyof typeof currentAssignment.hint]
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ModulePage;