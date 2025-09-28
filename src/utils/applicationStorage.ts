export interface ApplicationData {
  vacancyId: string;
  name: string;
  contact: string;
  fileName?: string;
  date: string;
}

export const APPLICATIONS_KEY = 'edu_applications';

export const saveApplication = (applicationData: ApplicationData): void => {
  try {
    const existingApplications = getApplications();
    existingApplications.push(applicationData);
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(existingApplications));
  } catch (error) {
    console.error('Error saving application:', error);
  }
};

export const getApplications = (): ApplicationData[] => {
  try {
    const stored = localStorage.getItem(APPLICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error retrieving applications:', error);
    return [];
  }
};

export const getApplicationsByVacancy = (vacancyId: string): ApplicationData[] => {
  return getApplications().filter(app => app.vacancyId === vacancyId);
};

export const clearApplications = (): void => {
  try {
    localStorage.removeItem(APPLICATIONS_KEY);
  } catch (error) {
    console.error('Error clearing applications:', error);
  }
};