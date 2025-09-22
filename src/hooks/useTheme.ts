import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Verificar se há tema salvo no localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      return savedTheme;
    }
    
    // Verificar preferência do sistema
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    
    // Remove classes anteriores do html e body
    root.classList.remove('light', 'dark');
    body.classList.remove('light', 'dark');
    
    // Força um reflow para garantir que as classes sejam removidas
    root.offsetHeight;
    
    // Adiciona a classe do tema atual ao html e body
    root.classList.add(theme);
    body.classList.add(theme);
    
    // Força atualização do estilo
    root.setAttribute('data-theme', theme);
    
    // Força um reflow para garantir que as novas classes sejam aplicadas
    root.offsetHeight;
    
    // Salva no localStorage
    localStorage.setItem('theme', theme);
    
    // Força atualização de todas as variáveis CSS
    const style = document.createElement('style');
    style.textContent = `
      :root, html, body {
        color-scheme: ${theme};
      }
    `;
    document.head.appendChild(style);
    
    // Remove o style após aplicar
    setTimeout(() => {
      document.head.removeChild(style);
    }, 0);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      
      // Força atualização imediata do DOM
      setTimeout(() => {
        const root = window.document.documentElement;
        const body = window.document.body;
        
        // Remove todas as classes de tema
        root.classList.remove('light', 'dark');
        body.classList.remove('light', 'dark');
        
        // Força reflow
        root.offsetHeight;
        
        // Adiciona a nova classe
        root.classList.add(newTheme);
        body.classList.add(newTheme);
        
        // Força reflow novamente
        root.offsetHeight;
        
        // Atualiza atributo data-theme
        root.setAttribute('data-theme', newTheme);
      }, 0);
      
      return newTheme;
    });
  };

  const forceThemeUpdate = () => {
    const root = window.document.documentElement;
    const body = window.document.body;
    
    // Remove todas as classes
    root.classList.remove('light', 'dark');
    body.classList.remove('light', 'dark');
    
    // Força reflow
    root.offsetHeight;
    
    // Reaplica o tema atual
    root.classList.add(theme);
    body.classList.add(theme);
    root.setAttribute('data-theme', theme);
    
    // Força reflow
    root.offsetHeight;
  };

  return { theme, toggleTheme, setTheme, forceThemeUpdate };
}
