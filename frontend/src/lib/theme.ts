// Theme tokens for BHARAT-TWIN (executive, light-first)
export const theme = {
  bg: '#F7F9FC',
  surface: '#FFFFFF',
  surfaceAlt: '#F8FAFC',
  primary: '#0B3D91',
  accent: '#00A3A3',
  success: '#1E8E3E',
  warning: '#F9AB00',
  risk: '#D93025',
  text: '#1F2937',
  muted: '#6B7280',
};

export function applyTheme() {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  Object.entries(theme).forEach(([k, v]) => {
    root.style.setProperty(`--${k}`, String(v));
  });
}

export default theme;
